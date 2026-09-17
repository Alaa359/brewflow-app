'use server';

import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import {
  employeeSchema,
  employeeUpdateSchema,
} from '@/lib/validations/employee';

export type EmployeeErrors = {
  name?: string[];
  email?: string[];
  role?: string[];
  password?: string[];
  form?: string[];
};

export type EmployeeState =
  | {
      errors?: EmployeeErrors;
      message?: string;
      success?: boolean;
    }
  | undefined;

function fieldErrors(error: z.ZodError): EmployeeErrors {
  return error.flatten().fieldErrors as EmployeeErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function managedEstablishmentIds(userId: string): Promise<string[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { establishmentId: true },
  });
  return memberships.map((membership) => membership.establishmentId);
}

export async function createEmployee(
  _prev: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const user = await requireRole(Role.ADMIN);

  const validated = employeeSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies EmployeeState;
  }

  const { name, email, role, password } = validated.data;
  const passwordHash = await hash(password, 10);

  const managed = await managedEstablishmentIds(user.id);
  const managedSet = new Set(managed);
  const checked = formData.getAll('establishments').map(String);
  const establishments = Array.from(
    new Set([user.establishmentId, ...checked])
  ).filter((id) => managedSet.has(id));

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        memberships: {
          create: establishments.map((establishmentId) => ({
            establishmentId,
          })),
        },
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: {
          email: [
            'Cet email est déjà utilisé. Utilisez le bouton Éditer pour rattacher un compte existant.',
          ],
        },
        message: 'Création impossible.',
      } satisfies EmployeeState;
    }
    throw error;
  }

  revalidatePath('/employes');
  revalidatePath('/planning');
  return {
    success: true,
    message: 'Employé créé.',
  } satisfies EmployeeState;
}

export async function updateEmployee(
  id: string,
  _prev: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const user = await requireRole(Role.ADMIN);

  const managed = await managedEstablishmentIds(user.id);
  const managedSet = new Set(managed);

  const editable = await prisma.membership.findFirst({
    where: { userId: id, establishmentId: { in: managed } },
    select: { userId: true },
  });
  if (!editable) {
    return {
      errors: {
        form: ['Cet employé ne fait pas partie de vos établissements.'],
      },
      message: 'Modification impossible.',
    } satisfies EmployeeState;
  }

  const validated = employeeUpdateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies EmployeeState;
  }

  const { name, email, role, password } = validated.data;
  const data: {
    name: string;
    email: string;
    role: Role;
    passwordHash?: string;
  } = { name, email, role };
  if (password) {
    data.passwordHash = await hash(password, 10);
  }

  const isSelf = user.id === id;
  const checked = formData.getAll('establishments').map(String);
  const desired = Array.from(new Set(checked)).filter((establishmentId) =>
    managedSet.has(establishmentId)
  );
  if (isSelf) {
    desired.push(user.establishmentId);
  }

  const existing = await prisma.membership.findMany({
    where: { userId: id },
    select: { establishmentId: true },
  });
  const existingSet = new Set(
    existing.map((membership) => membership.establishmentId)
  );
  const toAdd = desired.filter(
    (establishmentId) => !existingSet.has(establishmentId)
  );
  const toRemove = Array.from(existingSet).filter(
    (establishmentId) =>
      managedSet.has(establishmentId) && !desired.includes(establishmentId)
  );

  if (existing.length - toRemove.length === 0) {
    return {
      errors: {
        form: [
          'Cet employé doit conserver au moins un établissement de rattachement.',
        ],
      },
      message: 'Modification impossible.',
    } satisfies EmployeeState;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data });

      if (toAdd.length > 0) {
        await tx.membership.createMany({
          data: toAdd.map((establishmentId) => ({
            userId: id,
            establishmentId,
          })),
          skipDuplicates: true,
        });
      }
      if (toRemove.length > 0) {
        await tx.membership.deleteMany({
          where: { userId: id, establishmentId: { in: toRemove } },
        });
        await tx.shift.deleteMany({
          where: { userId: id, establishmentId: { in: toRemove } },
        });
      }
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: { email: ['Cet email est déjà utilisé par un autre compte.'] },
        message: 'Modification impossible.',
      } satisfies EmployeeState;
    }
    throw error;
  }

  revalidatePath('/employes');
  revalidatePath('/planning');
  return {
    success: true,
    message: 'Employé mis à jour.',
  } satisfies EmployeeState;
}

export async function deleteEmployee(id: string) {
  const user = await requireRole(Role.ADMIN);

  if (id === user.id) {
    return;
  }

  const member = await prisma.membership.findUnique({
    where: {
      userId_establishmentId: {
        userId: id,
        establishmentId: user.establishmentId,
      },
    },
    select: { id: true },
  });
  if (!member) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.shift.deleteMany({
      where: { userId: id, establishmentId: user.establishmentId },
    });
    await tx.membership.deleteMany({
      where: { userId: id, establishmentId: user.establishmentId },
    });

    const remaining = await tx.membership.count({ where: { userId: id } });
    if (remaining === 0) {
      const stockEntries = await tx.stockEntry.count({ where: { userId: id } });
      if (stockEntries === 0) {
        await tx.user.deleteMany({ where: { id } });
      }
    }
  });

  revalidatePath('/employes');
  revalidatePath('/planning');
}

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { rangesOverlap, shiftSchema } from '@/lib/validations/shift';

export type ShiftErrors = {
  employeeId?: string[];
  dayOfWeek?: string[];
  startTime?: string[];
  endTime?: string[];
  form?: string[];
};

export type ShiftState =
  | {
      errors?: ShiftErrors;
      message?: string;
      success?: boolean;
    }
  | undefined;

function fieldErrors(error: z.ZodError): ShiftErrors {
  return error.flatten().fieldErrors as ShiftErrors;
}

export async function createShift(
  _prev: ShiftState,
  formData: FormData
): Promise<ShiftState> {
  const user = await requireRole(Role.ADMIN);

  const validated = shiftSchema.safeParse({
    employeeId: formData.get('employeeId'),
    dayOfWeek: formData.get('dayOfWeek'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies ShiftState;
  }

  const { employeeId, dayOfWeek, startTime, endTime } = validated.data;

  const member = await prisma.membership.findUnique({
    where: {
      userId_establishmentId: {
        userId: employeeId,
        establishmentId: user.establishmentId,
      },
    },
    select: { id: true },
  });
  if (!member) {
    return {
      errors: {
        employeeId: ["Cet employé n'appartient pas à l'établissement actif."],
      },
      message: 'Affectation impossible.',
    } satisfies ShiftState;
  }

  const existing = await prisma.shift.findMany({
    where: {
      establishmentId: user.establishmentId,
      userId: employeeId,
      dayOfWeek,
    },
    select: { id: true, startTime: true, endTime: true },
  });

  if (
    existing.some((shift) =>
      rangesOverlap(startTime, endTime, shift.startTime, shift.endTime)
    )
  ) {
    return {
      errors: {
        form: [
          'Ce créneau chevauche un horaire déjà planifié pour cet employé ce jour-là.',
        ],
      },
      message: 'Créneau refusé.',
    } satisfies ShiftState;
  }

  await prisma.shift.create({
    data: {
      userId: employeeId,
      dayOfWeek,
      startTime,
      endTime,
      establishmentId: user.establishmentId,
    },
  });

  revalidatePath('/planning');
  return {
    success: true,
    message: 'Créneau ajouté.',
  } satisfies ShiftState;
}

export async function deleteShift(id: string) {
  const user = await requireRole(Role.ADMIN);

  await prisma.shift.deleteMany({
    where: { id, establishmentId: user.establishmentId },
  });

  revalidatePath('/planning');
}

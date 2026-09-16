'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { SESSION_COOKIE, SESSION_MAX_AGE, encrypt } from '@/lib/auth/session';
import { ROLE_HOME } from '@/lib/auth/roles';

export type AuthErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  establishmentName?: string[];
  form?: string[];
};

export type AuthState =
  | {
      errors?: AuthErrors;
      message?: string;
    }
  | undefined;

function fieldErrors(error: z.ZodError): AuthErrors {
  return error.flatten().fieldErrors as AuthErrors;
}

function redirectToRoleHome(role: string) {
  redirect(ROLE_HOME[role as keyof typeof ROLE_HOME] ?? '/');
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies AuthState;
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      errors: { form: ['Email ou mot de passe incorrect.'] },
    } satisfies AuthState;
  }

  const passwordOk = await compare(password, user.passwordHash);
  if (!passwordOk) {
    return {
      errors: { form: ['Email ou mot de passe incorrect.'] },
    } satisfies AuthState;
  }

  const session = await encrypt({
    userId: user.id,
    role: user.role,
    establishmentId: user.establishmentId,
    name: user.name,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE / 1000,
  });

  redirectToRoleHome(user.role);
}

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    establishmentName: formData.get('establishmentName'),
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies AuthState;
  }

  const { name, email, password, establishmentName, address, phone } =
    validated.data;

  const passwordHash = await hash(password, 10);

  let user;
  try {
    user = await prisma.$transaction(async (tx) => {
      const establishment = await tx.establishment.create({
        data: { name: establishmentName, address, phone },
      });

      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'ADMIN',
          establishmentId: establishment.id,
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        errors: { email: ['Cet email est déjà utilisé.'] },
        message: 'Inscription impossible.',
      } satisfies AuthState;
    }
    throw error;
  }

  const session = await encrypt({
    userId: user.id,
    role: user.role,
    establishmentId: user.establishmentId,
    name: user.name,
    email: user.email,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE / 1000,
  });

  redirectToRoleHome(user.role);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}

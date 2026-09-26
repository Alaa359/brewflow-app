'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/dal';
import { rangesOverlap, createShiftSchema } from '@/lib/validations/shift';

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
  const user = await requireUser();
  const t = await getTranslations('Feedback.shifts');
  const tValidation = await getTranslations('Validation');
  const isAdmin = user.role === Role.ADMIN;

  const validated = createShiftSchema(tValidation).safeParse({
    employeeId: formData.get('employeeId') || user.id,
    dayOfWeek: formData.get('dayOfWeek'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: t('invalidFields'),
    } satisfies ShiftState;
  }

  const { employeeId, dayOfWeek, startTime, endTime } = validated.data;

  if (!isAdmin && employeeId !== user.id) {
    return {
      errors: {
        employeeId: [t('employeeNotInActiveEstablishment')],
      },
      message: t('assignmentFailed'),
    } satisfies ShiftState;
  }

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
        employeeId: [t('employeeNotInActiveEstablishment')],
      },
      message: t('assignmentFailed'),
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
        form: [t('overlapWithExisting')],
      },
      message: t('slotRejected'),
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
    message: t('slotAdded'),
  } satisfies ShiftState;
}

export async function deleteShift(id: string): Promise<{ success: boolean }> {
  const user = await requireUser();
  const isAdmin = user.role === Role.ADMIN;

  const result = await prisma.shift.deleteMany({
    where: {
      id,
      establishmentId: user.establishmentId,
      ...(isAdmin ? {} : { userId: user.id }),
    },
  });

  if (result.count === 0) {
    return { success: false };
  }

  revalidatePath('/planning');
  return { success: true };
}

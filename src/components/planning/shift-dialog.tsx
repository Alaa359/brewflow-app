'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createShift } from '@/actions/shifts';
import { DAY_NAMES, shiftPresets } from '@/lib/validations/shift';
import type { EmployeeRole } from '@/lib/validations/employee';

export function ShiftDialog({
  dayOfWeek,
  employees,
  onClose,
}: {
  dayOfWeek: number;
  employees: { id: string; name: string; role: EmployeeRole }[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createShift, undefined);
  const t = useTranslations('Planning');
  const tCommon = useTranslations('Common');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? '');
  const [day, setDay] = useState(dayOfWeek);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('shiftDialog.title')}</DialogTitle>
          <DialogDescription>{t('shiftDialog.description')}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeId">{t('shiftDialog.employee')}</Label>
            <input type="hidden" name="employeeId" value={employeeId} />
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="employeeId" className="w-full">
                <SelectValue
                  placeholder={t('shiftDialog.employeePlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.employeeId?.map((error) => (
              <p key={error} className="text-destructive text-xs">
                {error}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dayOfWeek">{t('shiftDialog.day')}</Label>
            <input type="hidden" name="dayOfWeek" value={day} />
            <Select
              value={String(day)}
              onValueChange={(value) => setDay(Number(value))}
            >
              <SelectTrigger id="dayOfWeek" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, index) => (
                  <SelectItem key={name} value={String(index)}>
                    {t(`days.${index}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.dayOfWeek?.map((error) => (
              <p key={error} className="text-destructive text-xs">
                {error}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('shiftDialog.preset')}</Label>
            <div className="flex flex-wrap gap-2">
              {shiftPresets.map((preset) => {
                const active =
                  startTime === preset.startTime && endTime === preset.endTime;
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStartTime(preset.startTime);
                      setEndTime(preset.endTime);
                    }}
                  >
                    {t(`presets.${preset.id}`)}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">{t('shiftDialog.start')}</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                aria-invalid={!!state?.errors?.startTime}
              />
              {state?.errors?.startTime?.map((error) => (
                <p key={error} className="text-destructive text-xs">
                  {error}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">{t('shiftDialog.end')}</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                aria-invalid={!!state?.errors?.endTime}
              />
              {state?.errors?.endTime?.map((error) => (
                <p key={error} className="text-destructive text-xs">
                  {error}
                </p>
              ))}
            </div>
          </div>

          {state?.errors?.form?.map((error) => (
            <p
              key={error}
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs"
            >
              {error}
            </p>
          ))}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button type="submit" disabled={pending || employeeId === ''}>
              {pending ? t('shiftDialog.submitting') : t('shiftDialog.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

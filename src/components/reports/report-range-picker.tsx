import Link from 'next/link';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ReportPreset = { label: string; debut: string; fin: string };

export function ReportRangePicker({
  debut,
  fin,
  presets,
  error,
}: {
  debut: string;
  fin: string;
  presets: ReportPreset[];
  error?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <form
        action="/rapports"
        method="get"
        className="flex flex-wrap items-end gap-2"
      >
        <div className="grid gap-1">
          <Label htmlFor="debut" className="text-muted-foreground text-xs">
            Du
          </Label>
          <Input
            id="debut"
            name="debut"
            type="date"
            defaultValue={debut}
            className="w-40"
            required
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="fin" className="text-muted-foreground text-xs">
            Au
          </Label>
          <Input
            id="fin"
            name="fin"
            type="date"
            defaultValue={fin}
            className="w-40"
            required
          />
        </div>
        <Button type="submit" size="sm">
          Afficher
        </Button>
      </form>

      <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
        {presets.map((preset) => {
          const active = preset.debut === debut && preset.fin === fin;
          return (
            <Link
              key={preset.label}
              href={`/rapports?debut=${preset.debut}&fin=${preset.fin}`}
              className={cn(
                'hover:text-foreground rounded px-2 py-1 transition-colors',
                active && 'bg-muted text-foreground'
              )}
            >
              {preset.label}
            </Link>
          );
        })}
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

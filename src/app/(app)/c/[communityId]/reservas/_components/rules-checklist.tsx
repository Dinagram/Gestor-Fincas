import {
  Brush,
  Moon,
  PawPrint,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ROOM_RULES } from '@/lib/constants';

const ICONS: LucideIcon[] = [UserCheck, Users, Brush, ShieldCheck, Moon, PawPrint];

export function RulesChecklist() {
  return (
    <ul className="space-y-2">
      {ROOM_RULES.map((rule, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        return (
          <li key={rule} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dd-terracota/10 text-dd-terracota">
              <Icon className="h-3 w-3" />
            </span>
            <span className="leading-snug text-muted-foreground">{rule}</span>
          </li>
        );
      })}
    </ul>
  );
}

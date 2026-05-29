import { cn, hashHue, initials } from '@/lib/utils';

interface Props {
  name: string | null | undefined;
  seed?: string | null;
  className?: string;
}

export function AvatarGradient({ name, seed, className }: Props) {
  const key = seed ?? name ?? 'anonymous';
  const hue = hashHue(key);
  const from = `hsl(${hue}, 70%, 55%)`;
  const to = `hsl(${(hue + 35) % 360}, 70%, 45%)`;

  return (
    <div
      className={cn(
        'avatar-gradient flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold text-white',
        className,
      )}
      style={{ '--avatar-from': from, '--avatar-to': to } as React.CSSProperties}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

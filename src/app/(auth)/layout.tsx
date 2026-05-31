import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/assets/brand/marca_bronce.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span>GestiónFinca</span>
          </Link>
          <span className="text-sm text-muted-foreground">Tu comunidad, en orden</span>
        </div>
      </header>
      <main className="container flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

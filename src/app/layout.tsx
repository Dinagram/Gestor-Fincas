import type { Metadata } from 'next';
import { Bodoni_Moda, IBM_Plex_Mono, Spectral } from 'next/font/google';

import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

// Marca DD²: Bodoni Moda (titulares), Spectral (cuerpo), IBM Plex Mono (etiquetas)
const display = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const body = Spectral({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal'],
  variable: '--font-body',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GestiónFinca — Tu comunidad, en orden',
  description:
    'Plataforma SaaS para comunidades de propietarios: incidencias, votaciones, comunicados, presupuesto y directorio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

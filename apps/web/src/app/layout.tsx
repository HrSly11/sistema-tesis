import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'INBESTIGA.TESIS | Plataforma Académica y Aceleradora de Tesis',
  description:
    'Sistema avanzado de captación, calificación de investigación, negociación con IA y acompañamiento de tesis universitarias según metodología IMPULSE.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="glass-panel border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-600 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-medium">
                © 2026 <strong className="text-slate-900 dark:text-white">INBESTIGA.TESIS</strong> — Inteligencia de Negocios & Metodología IMPULSE.
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Rigor Científico</span>
                <span>•</span>
                <span>Doctores & Magísteres</span>
                <span>•</span>
                <span>SQL Server & Data Warehouse</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

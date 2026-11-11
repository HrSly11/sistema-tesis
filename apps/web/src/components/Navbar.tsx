'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Users,
  MessageSquare,
  BarChart3,
  Bot,
  FileText,
  Radio,
  Menu,
  X,
  BookOpen,
  Receipt,
  CreditCard,
  Layers,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

type NavLink = { href: string; label: string; icon: any; highlight?: boolean };
type NavGroup = { label: string; icon: any; highlight?: boolean; children: NavLink[] };
type NavEntry = NavLink | NavGroup;
const isGroup = (e: NavEntry): e is NavGroup => 'children' in e;

export default function Navbar() {
  const pathname = usePathname();
  const [waConnected, setWaConnected] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    api
      .getWhatsAppStatus()
      .then((res) => {
        if (res?.connected || res?.session === 'CONNECTED' || res?.status === 'AUTHENTICATED') {
          setWaConnected(true);
        }
      })
      .catch(() => setWaConnected(false));
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const navEntries: NavEntry[] = [
    { href: '/', label: 'Inicio', icon: GraduationCap },
    { href: '/formulario', label: 'Formulario', icon: FileText },
    {
      label: 'LEADS',
      icon: Users,
      children: [
        { href: '/admin/buyers', label: 'Buyers', icon: Users },
        { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare },
      ],
    },
    {
      label: 'PAYERS',
      icon: CreditCard,
      highlight: true,
      children: [
        { href: '/admin/payers', label: 'Órdenes de Pago', icon: Layers },
        { href: '/admin/payers/live-chat', label: 'Live Chat', icon: MessageSquare },
        { href: '/admin/payers/reporte', label: 'Reporte BI R-PAYERS', icon: BarChart3 },
        { href: '/admin/payers/evaluacion', label: 'Evaluación del Agente', icon: ShieldCheck },
      ],
    },
    { href: '/admin/dashboard', label: 'Dashboard BI', icon: BarChart3 },
    { href: '/admin/customers', label: 'Bitácora', icon: BookOpen },
    { href: '/admin/comprobantes', label: 'Comprobantes', icon: Receipt },
    { href: '/admin/agent-config', label: 'Agente IA', icon: Bot },
  ];

  // Ruta activa más específica dentro de un grupo (evita marcar "Órdenes" cuando se está en su sub-ruta)
  const isChildActive = (href: string, siblings: NavLink[]) => {
    if (pathname === href) return true;
    if (!pathname.startsWith(href + '/')) return false;
    return !siblings.some((s) => s.href !== href && s.href.startsWith(href + '/') && pathname.startsWith(s.href));
  };
  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800/80 shadow-md transition-colors duration-200">
      <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  INBESTIGA<span className="text-blue-600 dark:text-sky-400">.TESIS</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/30">
                  IMPULSE
                </span>
              </div>
              <p className="hidden 2xl:block text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Aceleración & Rigor Metodológico
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav ref={navRef} className="hidden xl:flex items-center gap-1">
            {navEntries.map((item) => {
              const Icon = item.icon;

              if (isGroup(item)) {
                const groupActive = item.children.some((c) => isChildActive(c.href, item.children));
                const open = openGroup === item.label;
                return (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenGroup(open ? null : item.label)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        groupActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : item.highlight
                            ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800/80 border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${groupActive ? 'text-white' : item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      {item.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                      <div className="absolute left-0 top-full mt-2 min-w-[210px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1.5 space-y-0.5 animate-fade-in">
                        {item.children.map((c) => {
                          const CIcon = c.icon;
                          const active = isChildActive(c.href, item.children);
                          return (
                            <Link
                              key={c.href}
                              href={c.href}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                active
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <CIcon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                              {c.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>


          {/* Right Status Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                waConnected
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title={waConnected ? 'OpenWA vinculado y listo' : 'OpenWA en escucha'}
            >
              <Radio className={`w-3 h-3 ${waConnected ? 'text-emerald-500 dark:text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden md:inline">OpenWA</span>
              <span>{waConnected ? 'En línea' : 'Activo'}</span>
            </div>

            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label="Menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Navegación del Sistema</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">WhatsApp:</span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  waConnected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {waConnected ? 'Conectado' : 'Activo'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navEntries.flatMap((item) =>
              isGroup(item)
                ? item.children.map((c) => ({ ...c, label: `${item.label} · ${c.label}`, highlight: item.highlight, group: item.children }))
                : [{ ...item, group: [] as NavLink[] }],
            ).map((item) => {
              const Icon = item.icon;
              const isActive = item.group.length ? isChildActive(item.href, item.group) : isLinkActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.highlight
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

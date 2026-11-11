'use client';

import Link from 'next/link';
import { Bot, MessageSquare, ArrowRight, ShieldCheck, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function LeadsTemplatePage() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Encabezado */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-sky-300 border border-blue-300 dark:border-blue-800">
            <Bot className="w-3.5 h-3.5" />
            <span>FASE 2: LEADS — PLANTILLA MODULAR</span>
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Funnel IMPULSE: Buyers → Leads → Payers
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Gestión de Leads & Diagnóstico Académico
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Espacio reservado para el seguimiento de prospectos calificados con propuesta y plan de pagos acordado. Una vez confirmado el contrato, se genera la orden y se traspasa automáticamente a <strong>PAYERS</strong>.
        </p>
      </div>

      {/* Grid informativo de plantilla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            Live Chat de Negociación (LEADS)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Simulador de conversación para acordar modalidad (contado o cuotas), aplicar políticas comerciales y congelar precio antes del handoff.
          </p>
          <Link
            href="/admin/leads/live-chat"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline pt-1"
          >
            <span>Abrir plantilla de Live Chat LEADS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            Traspaso a PAYERS (HANDOFF_LEADS)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Cuando el lead acepta la cotización, se emite el primer enlace de pago y el expediente pasa a la fase de cobranza y dunning.
          </p>
          <Link
            href="/admin/payers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
          >
            <span>Ir a Órdenes de Pago (PAYERS)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

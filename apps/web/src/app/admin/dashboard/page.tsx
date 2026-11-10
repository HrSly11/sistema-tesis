'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  Award,
  Database,
  ArrowRight,
  RefreshCw,
  Sparkles,
  PieChart,
  School,
  Briefcase,
  Layers,
  GraduationCap,
  MapPin,
  Calendar,
  FileText,
  Radio,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Zap,
  Star,
  UserCheck,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';

type TabType = 'ALL' | 'BUYERS' | 'LEADS' | 'PAYERS' | 'CUSTOMERS';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [etlRunning, setEtlRunning] = useState(false);
  const [etlMessage, setEtlMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRunEtl = async () => {
    setEtlRunning(true);
    setEtlMessage(null);
    try {
      const res = await api.runEtl();
      setEtlMessage(`✓ ETL exitoso (${res.duracionMs} ms): INBESTIGA_MART y Data Marts sincronizados`);
      await fetchMetrics();
    } catch (err: any) {
      setEtlMessage(`Error en ETL: ${err.message}`);
    } finally {
      setEtlRunning(false);
    }
  };

  const renderBadge = (estado: string | undefined, metaText?: string) => {
    const st = estado?.toUpperCase();
    if (st === 'VERDE' || st === 'BUENO') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{st === 'BUENO' ? 'BUENO' : 'VERDE'}</span>
          {metaText && <span className="font-normal opacity-80">({metaText})</span>}
        </span>
      );
    }
    if (st === 'AMARILLO' || st === 'REGULAR') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{st === 'REGULAR' ? 'REGULAR' : 'ALERTA'}</span>
          {metaText && <span className="font-normal opacity-80">({metaText})</span>}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>CRÍTICO</span>
        {metaText && <span className="font-normal opacity-80">({metaText})</span>}
      </span>
    );
  };

  if (loading && !data) {
    return (
      <div className="py-32 text-center text-slate-500 dark:text-slate-400">
        <span className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 dark:border-sky-400 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold tracking-wide">Cargando métricas de los 4 Data Marts (Kimball)...</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Conectando con INBESTIGA_MART + Data Marts</p>
      </div>
    );
  }

  const funnel = data?.funnel || { universo: 50, buyers: 33, leads: 23, payers: 86, customers: 86 };
  const conversiones = data?.conversiones || { universoABuyer: 66, buyerALead: 69.7, leadAPayer: 82.7, payerACustomer: 100 };
  const kpis = data?.kpis || { avgLeadScore: 78, montoRecaudado: 110480, totalPagos: 150, metodosPago: { CARD: 5, YAPE: 3, TRANSFER: 4, PagoEfectivo: 1 }, asesoresActivos: 4 };
  const segmentacion = data?.segmentacion || { universidades: [], carreras: [], objeciones: [] };
  const dm = data?.dataMarts || {};

  const buyersDm = dm.dm_buyers?.kpis;
  const leadsDm = dm.dm_leads?.kpis;
  const payersDm = dm.dm_payers?.kpis;
  const customersDm = dm.dm_customers?.kpis;

  const payersConv = payersDm?.conversion || {
    total_ordenes_pago: 104,
    ordenes_con_pago_confirmado: 86,
    tasa_confirmacion_pago_p01_pct: 82.7,
    monto_comprometido_soles: 180540,
    monto_exigible_soles: 121400,
    monto_cobrado_soles: 110480,
    tasa_cobranza_efectiva_p04_pct: 91.0,
  };
  const payersCulqi = payersDm?.tiempoConfirmacionCulqi || {
    promedio_minutos_primer_pago_p02: 8.6,
    meta_minutos: 10.0,
    estado_semaforo: 'Bueno',
    tasa_confirmacion_webhook_p05_pct: 82.0,
    total_pagos_confirmados: 150,
    pagos_por_webhook: 123,
    comision_pasarela_soles: 3013.81,
    costo_cobro_pct_p06: 2.73,
  };
  const payersAlertas = payersDm?.recuperacionAlertasCobranza || {
    total_alertados: 55,
    total_recuperados_72h: 34,
    tasa_recuperacion_p03_pct: 61.8,
    escalamientos_humano: 21,
    monto_recuperado_soles: 46510,
  };

  const funnelStages = [
    {
      name: 'UNIVERSO',
      count: funnel.universo,
      label: 'Alcanzados / Tráfico',
      rate: null,
      lightBg: 'from-slate-50 to-slate-100/90 text-slate-900 border-slate-200',
      darkBg: 'dark:from-slate-900/90 dark:to-slate-950 dark:text-slate-100 dark:border-slate-800',
    },
    {
      name: 'BUYERS (Fase 1)',
      count: funnel.buyers,
      label: 'Formularios Registrados',
      rate: `${conversiones.universoABuyer}%`,
      lightBg: 'from-blue-50/80 to-blue-100/60 text-blue-950 border-blue-200',
      darkBg: 'dark:from-blue-950/40 dark:to-slate-900 dark:text-blue-100 dark:border-blue-900/50',
    },
    {
      name: 'LEADS (Fase 2)',
      count: funnel.leads,
      label: 'Calificados (Score ≥ 70)',
      rate: `${conversiones.buyerALead}%`,
      lightBg: 'from-indigo-50/80 to-indigo-100/60 text-indigo-950 border-indigo-200',
      darkBg: 'dark:from-indigo-950/40 dark:to-slate-900 dark:text-indigo-100 dark:border-indigo-900/50',
    },
    {
      name: 'PAYERS (Fase 3)',
      count: payersConv.ordenes_con_pago_confirmado ?? funnel.payers,
      label: `Órdenes Confirmadas (de ${payersConv.total_ordenes_pago ?? 104})`,
      rate: `${payersConv.tasa_confirmacion_pago_p01_pct ?? conversiones.leadAPayer}%`,
      lightBg: 'from-emerald-50/80 to-emerald-100/60 text-emerald-950 border-emerald-200',
      darkBg: 'dark:from-emerald-950/40 dark:to-slate-900 dark:text-emerald-100 dark:border-emerald-900/50',
    },
    {
      name: 'CUSTOMERS (Fase 4)',
      count: payersConv.ordenes_con_pago_confirmado ?? funnel.customers,
      label: 'En Asesoría Activa (RN-04)',
      rate: '100%',
      lightBg: 'from-purple-50/80 to-purple-100/60 text-purple-950 border-purple-200',
      darkBg: 'dark:from-purple-950/40 dark:to-slate-900 dark:text-purple-100 dark:border-purple-900/50',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header with ETL Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <BarChart3 className="w-5 h-5" />
              </span>
              <span>Inteligencia de Negocios: 4 Data Marts</span>
            </h1>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-sky-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
              Arquitectura Ralph Kimball
            </span>
            <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              INBESTIGA_MART + DW (Live)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            Monitoreo analítico por procesos de negocio: Captación (Buyers), Negociación IA (Leads), Cobranza Automatizada R-PAYERS (Payers) y Atención (Customers).
          </p>
        </div>

        {/* Action Button: Ejecutar ETL */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {etlMessage && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 max-w-md truncate">
              {etlMessage}
            </span>
          )}

          <Link
            href="/payers"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Abrir Módulo PAYERS (R-PAYERS)</span>
          </Link>

          <button
            onClick={handleRunEtl}
            disabled={etlRunning}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {etlRunning ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>SINCRONIZAR ETL (DATA MARTS)</span>
          </button>
        </div>
      </div>

      {/* Global Funnel Overview */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Embudo Metodológico Integral (Pipeline IMPULSE)</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Flujo de conversión desde el contacto inicial hasta la activación académica</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-900">
            Órdenes PAYERS: {payersConv.ordenes_con_pago_confirmado}/{payersConv.total_ordenes_pago} confirmadas (P01 = {payersConv.tasa_confirmacion_pago_p01_pct}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {funnelStages.map((stg, i) => (
            <div
              key={stg.name}
              className={`p-3.5 rounded-xl border bg-gradient-to-b ${stg.lightBg} ${stg.darkBg} space-y-2.5 shadow-xs`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-slate-500 dark:text-slate-400">ETAPA {i + 1}</span>
                {stg.rate && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
                    {stg.rate}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-heading text-xs font-black truncate">{stg.name}</h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight mt-0.5 truncate">{stg.label}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-baseline justify-between">
                <span className="font-heading text-xl font-black">{stg.count}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">casos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs for the 4 Data Marts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Vista Holística (Todos los Marts)</span>
        </button>

        <button
          onClick={() => setActiveTab('BUYERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'BUYERS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Fase 1: dm_buyers (Captación)</span>
        </button>

        <button
          onClick={() => setActiveTab('LEADS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'LEADS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fase 2: dm_leads (Negociación IA)</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'PAYERS'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Fase 3: PAYERS (INBESTIGA_MART / R-PAYERS)</span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'CUSTOMERS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Fase 4: dm_customers (Atención)</span>
        </button>
      </div>

      {/* =========================================================================
          DATA MART 1: dm_buyers (Fase 1 - Captación y Marketing)
          ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'BUYERS') && (
        <div className="glass-panel p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 dark:border-blue-900/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Data Mart 1: Captación & Marketing (dm_buyers)
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Proceso: Captación de público objetivo, calificación de Lead Score y distribución por canales/campañas.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
              Hecho: dm_buyers.FACT_CAPTACION
            </span>
          </div>

          {/* Cards de KPIs de la Fase 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Conv. Buyer ➔ Lead
                </span>
                {renderBadge(buyersDm?.conversion?.estado_meta, 'Meta ≥ 15%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-sky-400 font-heading">
                {buyersDm?.conversion?.tasa_conversion_buyer_lead_pct ?? '0'}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {buyersDm?.conversion?.total_leads_generados ?? 0} leads de {buyersDm?.conversion?.total_buyers_captados ?? 0} buyers
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  1ª Respuesta IA
                </span>
                {renderBadge(buyersDm?.tiempoPrimeraRespuestaIA?.estado_meta, 'Meta ≤ 2 min')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {buyersDm?.tiempoPrimeraRespuestaIA?.minutos_promedio_primera_respuesta ?? '0'} min
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {buyersDm?.tiempoPrimeraRespuestaIA?.total_contactos_evaluados ?? 0} contactos evaluados
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Interacciones / Buyer
                </span>
                {renderBadge(buyersDm?.promedioInteracciones?.estado_meta, 'Meta ≥ 4')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {buyersDm?.promedioInteracciones?.promedio_interacciones_por_buyer ?? '0'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {buyersDm?.promedioInteracciones?.total_interacciones_acumuladas ?? 0} mensajes totales
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lead Score Prom.
                </span>
                {renderBadge('VERDE', 'Meta ≥ 70')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {kpis.avgLeadScore} pts
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ponderación algorítmica de 7 factores
              </p>
            </div>
          </div>

          {/* Desglose de Campañas y CPL + Canales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  Costo por Lead (CPL) por Campaña
                </span>
                <span className="text-[10px] font-mono text-slate-500">Meta ≤ S/ 8.00</span>
              </h4>
              <div className="space-y-2 text-xs">
                {buyersDm?.cplPorCampana?.length === 0 ? (
                  <p className="text-slate-400 text-xs">Sin campañas registradas.</p>
                ) : (
                  buyersDm?.cplPorCampana?.map((c: any) => (
                    <div key={c.campana_nombre} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <strong className="text-slate-900 dark:text-white truncate block">{c.campana_nombre}</strong>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Inversión: S/ {Number(c.inversion_marketing || 0).toLocaleString()} • Leads: {c.leads_generados}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          S/ {Number(c.costo_por_lead_cpl || 0).toFixed(2)}
                        </div>
                        {renderBadge(c.estado_meta)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  Rendimiento por Canal de Adquisición
                </span>
                <span className="text-[10px] font-mono text-slate-500">DIM_CANAL</span>
              </h4>
              <div className="space-y-2 text-xs">
                {buyersDm?.rendimientoCanales?.map((cnl: any) => (
                  <div key={cnl.canal_nombre} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 dark:text-white">{cnl.canal_nombre}</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Tipo: {cnl.canal_tipo} • Score Prom: {cnl.lead_score_promedio} pts
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-700 dark:text-sky-400">
                        {cnl.leads_generados} leads / {cnl.total_buyers}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                        {Number(cnl.tasa_conversion_canal_pct || 0).toFixed(1)}% conv.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DATA MART 2: dm_leads (Fase 2 - Negociación IA y Cierre)
          ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'LEADS') && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200 dark:border-indigo-900/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Data Mart 2: Conversión & Negociación con IA (dm_leads)
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Proceso: Diagnóstico del estado de la tesis, propuesta personalizada, resolución de dudas y política de descuentos.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
              Hecho: dm_leads.FACT_NEGOCIACION
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Conv. Lead ➔ Payer
                </span>
                {renderBadge(leadsDm?.conversion?.estado_meta, 'Meta ≥ 18%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 font-heading">
                {leadsDm?.conversion?.tasa_conversion_lead_payer_pct ?? '0'}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {leadsDm?.conversion?.total_convertidos_a_pago ?? 0} de {leadsDm?.conversion?.total_leads_negociados ?? 0} acuerdos cerrados
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recup. Objeciones
                </span>
                {renderBadge(leadsDm?.recuperacionObjeciones?.estado_meta, 'Meta ≥ 25%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {leadsDm?.recuperacionObjeciones?.tasa_recuperacion_objeciones_pct ?? '0'}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {leadsDm?.recuperacionObjeciones?.objeciones_convertidas_a_pago ?? 0} de {leadsDm?.recuperacionObjeciones?.total_leads_con_objecion ?? 0} objeciones resueltas
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Descuento Otorgado
                </span>
                {renderBadge(leadsDm?.descuentoPromedio?.estado_meta, 'Meta ≤ 10%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {leadsDm?.descuentoPromedio?.descuento_promedio_otorgado_pct ?? '0'}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Máximo registrado: {leadsDm?.descuentoPromedio?.descuento_maximo_registrado_pct ?? '0'}% (Tope: 15%)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Escalamiento Humano
                </span>
                {renderBadge(leadsDm?.escalamientoHumano?.estado_meta, 'Meta 15–20%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {leadsDm?.escalamientoHumano?.tasa_escalamiento_pct ?? '0'}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {leadsDm?.escalamientoHumano?.casos_escalados_a_humano ?? 0} transferidos a supervisor
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Rendimiento de Negociación por Universidad
              </span>
              <span className="text-[10px] font-mono text-slate-500">dm_shared.DIM_UNIVERSIDAD</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {leadsDm?.desglosePorUniversidad?.map((u: any) => (
                <div key={u.universidad_siglas} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">{u.universidad_siglas}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[180px]">
                      {u.universidad_nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 block">
                      {u.total_negociaciones} negociaciones
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Desc. {u.descuento_promedio_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DATA MART 3: PAYERS (Fase 3 - Cobranza Automatizada R-PAYERS en INBESTIGA_MART)
          ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'PAYERS') && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-900/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Data Mart 3: Cobranza Automatizada, Pasarela & Activación (INBESTIGA_MART — R-PAYERS)
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Proceso: 104 órdenes de pago, 86 activadas (P01 = 82.7%), tiempo al primer pago P02 = 8.6 min, recuperación tras alerta P03 = 61.8%, cobranza efectiva P04 = 91.0%, webhook P05 = 82.0% y costo pasarela P06 = 2.73%.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Hechos: FACT_COBRANZA + FACT_PAGO
              </span>
              <Link
                href="/payers"
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Ver R-PAYERS Completo →
              </Link>
            </div>
          </div>

          {/* 6 KPIs Oficiales P01 a P06 del Data Mart 3: PAYERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* P01: Tasa de confirmación de pago */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P01 • Confirmación de Orden
                </span>
                {renderBadge('BUENO', 'Meta ≥ 80%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {Number(payersConv.tasa_confirmacion_pago_p01_pct ?? 82.7).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {payersConv.ordenes_con_pago_confirmado ?? 86} confirmadas de {payersConv.total_ordenes_pago ?? 104} órdenes creadas
              </p>
            </div>

            {/* P02: Tiempo hasta el primer pago */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P02 • Tiempo al Primer Pago
                </span>
                {renderBadge(payersCulqi.estado_semaforo || 'BUENO', 'Meta ≤ 10 min')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {Number(payersCulqi.promedio_minutos_primer_pago_p02 ?? 8.6).toFixed(1)} min
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Promedio en {payersConv.ordenes_con_pago_confirmado ?? 86} órdenes activadas
              </p>
            </div>

            {/* P03: Recuperación tras Alerta */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P03 • Recup. por Alerta (≤72h)
                </span>
                {renderBadge('BUENO', 'Meta ≥ 25%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {Number(payersAlertas.tasa_recuperacion_p03_pct ?? 61.8).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {payersAlertas.total_recuperados_72h ?? 34} recuperados de {payersAlertas.total_alertados ?? 55} alertados ({payersAlertas.escalamientos_humano ?? 21} escalados)
              </p>
            </div>

            {/* P04: Tasa de cobranza efectiva */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P04 • Cobranza Efectiva
                </span>
                {renderBadge('BUENO', 'Meta ≥ 90%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading">
                {Number(payersConv.tasa_cobranza_efectiva_p04_pct ?? 91.0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                S/ {Number(payersConv.monto_cobrado_soles ?? 110480).toLocaleString('es-PE', { minimumFractionDigits: 2 })} cobrado de S/ {Number(payersConv.monto_exigible_soles ?? 121400).toLocaleString('es-PE', { minimumFractionDigits: 2 })} exigible
              </p>
            </div>

            {/* P05: Confirmación automática por Webhook */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P05 • Confirmación Webhook
                </span>
                {renderBadge('BUENO', 'Meta ≥ 80%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-sky-400 font-heading">
                {Number(payersCulqi.tasa_confirmacion_webhook_p05_pct ?? 82.0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {payersCulqi.pagos_por_webhook ?? 123} automáticos de {payersCulqi.total_pagos_confirmados ?? 150} pagos confirmados
              </p>
            </div>

            {/* P06: Costo de cobro sobre ingresos */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  P06 • Costo de Pasarela
                </span>
                {renderBadge('BUENO', 'Meta ≤ 3.5%')}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {Number(payersCulqi.costo_cobro_pct_p06 ?? 2.73).toFixed(2)}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                S/ {Number(payersCulqi.comision_pasarela_soles ?? 3013.81).toLocaleString('es-PE', { minimumFractionDigits: 2 })} comisión sobre S/ {Number(payersConv.monto_cobrado_soles ?? 110480).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Desglose por Medio de Pago y Canal de Confirmación (Vista 3.3 R-PAYERS) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Vista 3.3 — Confirmación Automática y Costo por Medio de Pago (INBESTIGA_MART.dbo.vw_rpayers_vista_3_3_medios)
              </span>
              <span className="text-[10px] font-mono text-slate-500">150 Pagos Confirmados</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-3 font-semibold">Medio de Pago</th>
                    <th className="py-2 px-3 font-semibold">Proveedor</th>
                    <th className="py-2 px-3 font-semibold">Canal Confirmación</th>
                    <th className="py-2 px-3 font-semibold text-center">Pagos</th>
                    <th className="py-2 px-3 font-semibold text-center">Webhook (P05)</th>
                    <th className="py-2 px-3 font-semibold text-right">Monto Cobrado</th>
                    <th className="py-2 px-3 font-semibold text-right">Comisión (P06)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payersDm?.recaudacionPorMetodoYCuota?.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        {r.medio_pago || r.metodo_pago}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {r.proveedor || r.pasarela}
                      </td>
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {r.canal_confirmacion || 'Webhook Culqi'}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">
                        {Number(r.pagos_confirmados ?? r.cantidad_transacciones ?? 0)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        {Number(r.pagos_por_webhook ?? 0)} ({Number(r.pct_confirmacion_auto_p05 ?? 0).toFixed(1)}%)
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        S/ {Number(r.monto_cobrado ?? r.monto_total_recaudado_pen ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        S/ {Number(r.comision_pasarela ?? 0).toFixed(2)} ({Number(r.pct_costo_cobro_p06 ?? 0).toFixed(2)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DATA MART 4: dm_customers (Fase 4 - Atención, Bitácora y Acompañamiento)
          ========================================================================= */}
      {(activeTab === 'ALL' || activeTab === 'CUSTOMERS') && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 dark:border-purple-900/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Data Mart 4: Atención, Bitácora & Cumplimiento (dm_customers)
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Proceso: Asignación de asesor metodológico, ejecución de sesiones Google Meet, bitácora de tesis y satisfacción.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
              Hecho: dm_customers.FACT_ATENCION
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Asignación Asesor
                </span>
                {renderBadge(customersDm?.tiempoAsignacionAsesor?.estado_meta, '≤ 24h')}
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-400 font-heading">
                {customersDm?.tiempoAsignacionAsesor?.horas_promedio_asignacion ?? '0'} hrs
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {customersDm?.tiempoAsignacionAsesor?.total_asignaciones ?? 0} asesores designados
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  1ª Sesión en ≤48h
                </span>
                {renderBadge(customersDm?.primeraSesion48h?.estado_meta, '≥ 85%')}
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                {customersDm?.primeraSesion48h?.tasa_primera_sesion_48h_pct ?? '0'}%
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {customersDm?.primeraSesion48h?.sesiones_en_menos_48h ?? 0} de {customersDm?.primeraSesion48h?.total_customers_atendidos ?? 0} en plazo
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Cumplim. Cronograma
                </span>
                {renderBadge(customersDm?.cumplimientoCronograma?.estado_meta, '≥ 75%')}
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                {customersDm?.cumplimientoCronograma?.tasa_cumplimiento_cronograma_pct ?? '0'}%
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Avance tesis prom: {customersDm?.cumplimientoCronograma?.promedio_avance_tesis_pct ?? '0'}%
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Alerta Riesgo
                </span>
                {renderBadge(customersDm?.deteccionRiesgoAbandono?.estado_meta, '≤ 10%')}
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {customersDm?.deteccionRiesgoAbandono?.tasa_casos_en_riesgo_pct ?? '0'}%
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {customersDm?.deteccionRiesgoAbandono?.casos_con_alerta_riesgo ?? 0} casos en pausa o peligro
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  Satisfacción
                </span>
                {renderBadge(customersDm?.satisfaccionPromedio?.estado_meta, '≥ 4.2')}
              </div>
              <p className="text-2xl font-black text-amber-500 dark:text-amber-400 font-heading flex items-center gap-1">
                <span>{customersDm?.satisfaccionPromedio?.satisfaccion_promedio_estrellas ?? '0'}</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {customersDm?.satisfaccionPromedio?.total_encuestas_respondidas ?? 0} encuestas respondidas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

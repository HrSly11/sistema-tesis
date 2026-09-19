'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Bot,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  GraduationCap,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Send,
  AlertCircle,
  Building2,
  BookOpen,
  RotateCcw,
  DollarSign,
  UserCheck,
  Video,
  Calendar,
  ShieldCheck,
  CreditCard,
  Award,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Estado de acción [INICIAR NEGOCIACIÓN]
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<any>(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { orderBy: 'leadScore', orderDir: 'desc' };
      if (search) params.search = search;
      if (filtroEstado) params.estadoFunnel = filtroEstado;

      const data = await api.getBuyers(params);
      setBuyers(data || []);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [filtroEstado]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBuyers();
  };

  const handleIniciarNegociacion = async (buyer: any) => {
    setNegotiatingId(buyer.id);
    setNegotiationResult(null);

    try {
      const res = await api.iniciarNegociacion(buyer.id);
      setNegotiationResult(res);
      fetchBuyers();
    } catch (err: any) {
      alert(`Error al iniciar negociación: ${err.message}`);
    } finally {
      setNegotiatingId(null);
    }
  };

  const handleLimpiarChat = async (buyer: any) => {
    if (!confirm(`¿Reiniciar chat con ${buyer.nombres} ${buyer.apellidos}? Se borrarán los mensajes para iniciar una nueva prueba desde cero.`)) return;
    setClearingId(buyer.id);
    try {
      await api.limpiarConversacionPorBuyer(buyer.id);
      await fetchBuyers();
      alert(`Chat con ${buyer.nombres} reiniciado exitosamente. Puedes volver a pulsar [INICIAR NEGOCIACIÓN].`);
    } catch (err: any) {
      alert(`Error al reiniciar chat: ${err.message}`);
    } finally {
      setClearingId(null);
    }
  };

  const verDetalle = async (id: string) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const full = await api.getBuyer(id);
      setSelectedBuyer(full);
    } catch (e: any) {
      alert(e.message);
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Conteos por estado para los tabs rápidos
  const totalCount = buyers.length;
  const buyersCount = buyers.filter((b) => b.estadoFunnel === 'BUYER').length;
  const leadsCount = buyers.filter((b) => b.estadoFunnel === 'LEAD').length;
  const payersCount = buyers.filter((b) => b.estadoFunnel === 'PAYER').length;
  const customersCount = buyers.filter((b) => b.estadoFunnel === 'CUSTOMER').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-sky-400 shadow-sm">
                <Users className="w-5 h-5" />
              </span>
              <span>Gestión del Funnel de Clientes</span>
            </h1>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
              Población: 9no / 10mo Ciclo • Bachiller & Tesis
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 break-words">
            Seguimiento integral del estudiante: <strong className="text-slate-900 dark:text-slate-200 font-bold">BUYER ➔ LEAD ➔ PAYER ➔ CUSTOMER</strong> con visualización de montos pagados y asesor doctoral asignado.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/formulario"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            + Registrar Formulario
          </Link>
          <Link
            href="/admin/live-chat"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat</span>
          </Link>
        </div>
      </div>

      {/* Modal / Alert de Negociación Iniciada */}
      {negotiationResult && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/20 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in min-w-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Negociación Iniciada Exitosamente por WhatsApp!</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Estudiante: {negotiationResult.estudiante} ({negotiationResult.whatsapp})
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 break-words">
              "{negotiationResult.mensajeInicial}"
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/live-chat?conversacionId=${negotiationResult.conversacionId}`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ver en Live Chat</span>
            </Link>
            <button
              onClick={() => setNegotiationResult(null)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs Rápidos de Filtrado por Estado del Funnel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFiltroEstado('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filtroEstado === ''
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <span>Todos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 dark:bg-white/15">{totalCount}</span>
        </button>

        <button
          onClick={() => setFiltroEstado('BUYER')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filtroEstado === 'BUYER'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>1. BUYERS</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">{buyersCount}</span>
        </button>

        <button
          onClick={() => setFiltroEstado('LEAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filtroEstado === 'LEAD'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>2. LEADS (Calificados)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">{leadsCount}</span>
        </button>

        <button
          onClick={() => setFiltroEstado('PAYER')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filtroEstado === 'PAYER'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>3. PAYERS (Pagos)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">{payersCount}</span>
        </button>

        <button
          onClick={() => setFiltroEstado('CUSTOMER')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            filtroEstado === 'CUSTOMER'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>4. CUSTOMERS (En Asesoría)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">{customersCount}</span>
        </button>
      </div>

      {/* Filters Bar & Search */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos los Estados (IMPULSE)</option>
            <option value="BUYER">BUYER (En descubrimiento)</option>
            <option value="LEAD">LEAD (Calificado Score &ge; 50)</option>
            <option value="PAYER">PAYER (Pago confirmado)</option>
            <option value="CUSTOMER">CUSTOMER (En asesoría activa)</option>
          </select>
        </div>
      </div>

      {/* Buyers Table - Responsive Wrapper with Anti-Overflow */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="table-responsive-wrapper">
          <table className="w-full text-left text-xs border-collapse min-w-[920px]">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Universidad / Ciclo</th>
                <th className="py-3.5 px-4">Grado / Investigación</th>
                <th className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center justify-center gap-1">
                    Score & Prioridad <ArrowUpDown className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">Estado Funnel</th>
                <th className="py-3.5 px-4">Adquisición / Asesor</th>
                <th className="py-3.5 px-4 text-center">Acción Central</th>
                <th className="py-3.5 px-4 text-right">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-sky-400 border-t-transparent mr-2 align-middle" />
                    Cargando prospectos de SQL Server...
                  </td>
                </tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron registros para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                buyers.map((b) => {
                  const isLead = b.estadoFunnel === 'LEAD' || b.leadScore >= 50;
                  const isCustomer = b.estadoFunnel === 'CUSTOMER';
                  const isPayer = b.estadoFunnel === 'PAYER';
                  const prioridad = b.lead?.prioridad || (b.leadScore >= 75 ? 'ALTA' : b.leadScore >= 50 ? 'MEDIA' : 'BAJA');

                  const tipoEtiqueta =
                    b.tipoInvestigacion === 'TRABAJO_INVESTIGACION_BACHILLER'
                      ? 'Trabajo Bachiller'
                      : b.tipoInvestigacion === 'PLAN_DE_TESIS'
                      ? 'Plan de Tesis'
                      : 'Tesis de Grado';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Estudiante */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {b.nombres} {b.apellidos}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <a
                            href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5"
                          >
                            <Phone className="w-2.5 h-2.5 text-emerald-500" />
                            <span>{b.whatsapp}</span>
                          </a>
                        </div>
                      </td>

                      {/* Universidad & Ciclo */}
                      <td className="py-3.5 px-4 max-w-[170px]">
                        <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {b.universidad?.siglas || b.universidad?.nombre || 'UNT'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {b.carrera?.nombre || 'Sistemas'} • <span className="font-semibold text-slate-700 dark:text-slate-300">{b.ciclo || '10mo'}</span>
                        </div>
                      </td>

                      {/* Grado / Investigación */}
                      <td className="py-3.5 px-4 max-w-[160px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-blue-900/40 text-[10px] font-semibold truncate">
                          <GraduationCap className="w-3 h-3 text-sky-600 shrink-0" />
                          <span className="truncate">{tipoEtiqueta}</span>
                        </span>
                      </td>

                      {/* Score y Prioridad */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-heading font-black text-xs text-sky-700 dark:text-sky-400">
                            {b.leadScore} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-black tracking-wider ${
                              prioridad === 'ALTA'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                                : prioridad === 'MEDIA'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            }`}
                          >
                            {prioridad}
                          </span>
                        </div>
                      </td>

                      {/* Estado Funnel */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCustomer
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                              : isPayer
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : isLead
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {b.estadoFunnel}
                        </span>
                      </td>

                      {/* Adquisición / Asesor */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        {isPayer || isCustomer ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>S/ {Number(b.montoPagado || 2200).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-[10px] text-purple-700 dark:text-purple-300 font-medium truncate flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-purple-500 shrink-0" />
                              <span className="truncate">{b.asesorAsignado || 'Dr. Asignado'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isLead ? 'En Negociación' : 'En Prospección'}
                          </span>
                        )}
                      </td>

                      {/* Acción Central [ INICIAR NEGOCIACIÓN ] */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 mx-auto">
                          <button
                            onClick={() => handleIniciarNegociacion(b)}
                            disabled={negotiatingId === b.id}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                              isCustomer
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                : 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-blue-500/20'
                            }`}
                          >
                            {negotiatingId === b.id ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                <span>Generando IA...</span>
                              </>
                            ) : (
                              <>
                                <Bot className="w-3.5 h-3.5 shrink-0" />
                                <span>{b.tieneConversacionActiva ? 'REINICIAR / REENVIAR' : 'INICIAR NEGOCIACIÓN'}</span>
                              </>
                            )}
                          </button>

                          {b.tieneConversacionActiva && (
                            <button
                              onClick={() => handleLimpiarChat(b)}
                              disabled={clearingId === b.id}
                              className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shadow-xs cursor-pointer"
                              title="Limpiar chat y reiniciar prueba para este prospecto"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${clearingId === b.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Detalle Perfil */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => verDetalle(b.id)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Ver perfil completo del cliente y detalles de compra"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Modal de Detalle Completo del Estudiante */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-6 shadow-2xl bg-white dark:bg-slate-900">
            {loadingDetail || !selectedBuyer ? (
              <div className="py-16 text-center space-y-3">
                <span className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent" />
                <p className="text-xs text-slate-500">Cargando perfil completo del cliente...</p>
              </div>
            ) : (
              <>
                {/* Cabecera del Perfil */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                      {selectedBuyer.nombres?.[0]}{selectedBuyer.apellidos?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          Perfil de Estudiante Universitario
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            selectedBuyer.estadoFunnel === 'CUSTOMER'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                              : selectedBuyer.estadoFunnel === 'PAYER'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
                          }`}
                        >
                          {selectedBuyer.estadoFunnel}
                        </span>
                      </div>
                      <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                        {selectedBuyer.nombres} {selectedBuyer.apellidos}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Score & Resumen Académico */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Lead Score</p>
                    <p className="font-heading text-xl font-black text-sky-700 dark:text-sky-400">{selectedBuyer.leadScore} / 100</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Ciclo Académico</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{selectedBuyer.ciclo || '10mo ciclo'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Grado Requerido</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedBuyer.tipoInvestigacion === 'TRABAJO_INVESTIGACION_BACHILLER'
                        ? 'Grado Bachiller'
                        : 'Título Profesional'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Prioridad Comercial</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {selectedBuyer.lead?.prioridad || 'ALTA'}
                    </p>
                  </div>
                </div>

                {/* SECCIÓN CRÍTICA: SI YA ES PAYER O CUSTOMER (PRODUCTO ADQUIRIDO) */}
                {(selectedBuyer.estadoFunnel === 'PAYER' || selectedBuyer.estadoFunnel === 'CUSTOMER' || selectedBuyer.pagos?.length > 0 || selectedBuyer.customer) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-purple-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:via-purple-950/20 dark:to-blue-950/20 border border-emerald-300 dark:border-emerald-500/30 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/40 pb-2.5">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-heading font-black text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Adquisición Confirmada & Asignación Académica</span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {selectedBuyer.estadoFunnel === 'CUSTOMER' ? 'Servicio Activo' : 'Pago Acreditado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Monto Pagado */}
                      <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-500" />
                          <span>Monto Total Abonado:</span>
                        </span>
                        <p className="font-heading text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          S/ {Number(selectedBuyer.payer?.montoTotalPagado || selectedBuyer.pagos?.[0]?.monto || 2200).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Método: {selectedBuyer.payer?.metodoPrincipal || selectedBuyer.pagos?.[0]?.metodoPago || 'YAPE (Culqi)'}
                        </p>
                      </div>

                      {/* Asesor Asignado */}
                      <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-purple-500" />
                          <span>Asesor Académico Asignado:</span>
                        </span>
                        <p className="font-heading text-xs font-black text-purple-700 dark:text-purple-300 mt-1 truncate">
                          {selectedBuyer.customer?.asesor
                            ? `${selectedBuyer.customer.asesor.gradoAcademico || 'Dr.'} ${selectedBuyer.customer.asesor.nombres} ${selectedBuyer.customer.asesor.apellidos}`
                            : 'Dr. Fernando Mendoza Morales'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Especialidad: {selectedBuyer.customer?.asesor?.especialidad || 'Metodología de Tesis'}
                        </p>
                      </div>

                      {/* Servicio y Sesión */}
                      <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-500" />
                          <span>Servicio Contratado:</span>
                        </span>
                        <p className="font-heading text-xs font-bold text-sky-700 dark:text-sky-400 mt-1 truncate">
                          {selectedBuyer.customer?.servicio?.nombre || 'Tesis Integral de Grado'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Cotización: {selectedBuyer.pagos?.[0]?.cotizacion?.codigoCotizacion || 'COT-OFICIAL'}
                        </p>
                      </div>
                    </div>

                    {/* Sala de Google Meet Programada */}
                    {selectedBuyer.customer?.sesiones?.[0] && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-purple-600" />
                            <span>Primera Sesión: {selectedBuyer.customer.sesiones[0].temaTratado || 'Inducción y Diagnóstico'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Fecha programada: {new Date(selectedBuyer.customer.sesiones[0].fechaHoraProgramada).toLocaleDateString()} a las 5:00 PM
                          </p>
                        </div>
                        {selectedBuyer.customer.sesiones[0].enlaceReunion && (
                          <a
                            href={selectedBuyer.customer.sesiones[0].enlaceReunion}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Unirse a Google Meet</span>
                          </a>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60">
                      <Link
                        href="/admin/customers"
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Abrir Bitácora & Trazabilidad de la Tesis ➔</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Ficha Académica del Estudiante */}
                <div className="space-y-3 text-xs">
                  <h3 className="font-heading font-bold uppercase tracking-wider text-[11px] text-sky-700 dark:text-sky-400 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Datos Institucionales y de Investigación</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700 dark:text-slate-300">
                    <div className="truncate"><strong className="text-slate-900 dark:text-slate-200">Universidad:</strong> {selectedBuyer.universidad?.nombre || 'Universidad Nacional de Trujillo'}</div>
                    <div className="truncate"><strong className="text-slate-900 dark:text-slate-200">Carrera:</strong> {selectedBuyer.carrera?.nombre || 'Ingeniería de Sistemas'}</div>
                    <div className="truncate">
                      <strong className="text-slate-900 dark:text-slate-200">WhatsApp:</strong>{' '}
                      <a href={`https://wa.me/${selectedBuyer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-mono">
                        {selectedBuyer.whatsapp}
                      </a>
                    </div>
                    <div className="truncate"><strong className="text-slate-900 dark:text-slate-200">Email:</strong> {selectedBuyer.email}</div>
                    <div className="truncate"><strong className="text-slate-900 dark:text-slate-200">Situación Laboral:</strong> {selectedBuyer.situacionLaboral || 'No especificada'}</div>
                    <div className="truncate"><strong className="text-slate-900 dark:text-slate-200">Software Requerido:</strong> {selectedBuyer.softwareRequerido || 'Por definir'}</div>
                  </div>

                  {selectedBuyer.dolorPrincipal && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-800 dark:text-red-300 text-xs break-words">
                      <strong>Dolor Principal Detectado:</strong> {selectedBuyer.dolorPrincipal}
                    </div>
                  )}
                </div>

                {/* Acciones al pie del Modal */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>

                  <Link
                    href={`/admin/live-chat`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ver Conversaciones en Live Chat</span>
                  </Link>

                  {selectedBuyer.estadoFunnel !== 'CUSTOMER' && (
                    <button
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleIniciarNegociacion(selectedBuyer);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Iniciar Negociación con IA</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

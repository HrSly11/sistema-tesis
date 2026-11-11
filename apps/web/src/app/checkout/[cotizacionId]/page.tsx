'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Calendar,
  AlertCircle,
  Video,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const params = useParams();
  const cotizacionId = params?.cotizacionId as string;
  const router = useRouter();

  const [cotizacion, setCotizacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metodo, setMetodo] = useState<'CARD' | 'YAPE' | 'TRANSFER'>('YAPE');
  const [processing, setProcessing] = useState(false);
  const [pagoResultado, setPagoResultado] = useState<any>(null);

  // Form states
  const [numeroTarjeta, setNumeroTarjeta] = useState('4242 •••• •••• 4242');
  const [telefonoYape, setTelefonoYape] = useState('926 619 777');
  const [codigoAprobacion, setCodigoAprobacion] = useState('491823');
  const [mostrarQrAlternativo, setMostrarQrAlternativo] = useState(false);

  // Detección de Cuotas & Verificación Financiera
  const esCuotas = (cotizacion?.cuotas || 1) > 1;
  const cuotasTotal = cotizacion?.cuotas || 1;
  const totalContrato = Number(cotizacion?.total || 0);
  const yaPagado = cotizacion?.pagoEstado === 'CONFIRMADO' || cotizacion?.estado === 'PAGADA';
  const montoPorCuota = Number(cotizacion?.planCuotas?.montoPorCuota) || (esCuotas ? Math.round((totalContrato / cuotasTotal) * 100) / 100 : totalContrato);
  const [tipoAbono, setTipoAbono] = useState<'CUOTA' | 'TOTAL'>('CUOTA');

  const montoAPagar = esCuotas && tipoAbono === 'CUOTA' ? montoPorCuota : totalContrato;
  const saldoRestante = Math.max(0, totalContrato - montoAPagar);

  useEffect(() => {
    if (cotizacionId) {
      api
        .getCotizacionCheckout(cotizacionId)
        .then((res) => {
          setCotizacion(res);
          if (res?.estudiante?.whatsapp) {
            setTelefonoYape(res.estudiante.whatsapp);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [cotizacionId]);

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await api.procesarCheckout({
        cotizacionId,
        metodoPago: metodo,
        tipoAbono: esCuotas ? tipoAbono : 'TOTAL',
        montoAbonar: montoAPagar,
        referencia: `OP-${Math.floor(100000 + Math.random() * 900000)}`,
        numeroTarjeta: metodo === 'CARD' ? numeroTarjeta : undefined,
        telefonoYape: metodo === 'YAPE' ? telefonoYape : undefined,
        codigoAprobacion: metodo === 'YAPE' ? codigoAprobacion : undefined,
      });

      setPagoResultado(res);
    } catch (err: any) {
      alert(`Error procesando pago: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !cotizacion) {
    return (
      <div className="py-24 text-center text-slate-500 dark:text-slate-400">
        <span className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 dark:border-sky-400 border-t-transparent" />
        <p className="mt-2 text-xs font-semibold">Cargando orden de pago y cotización oficial...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      {pagoResultado?.status === 'confirmed' || yaPagado ? (
        /* Pantalla de Confirmación de Pago y Transición a CUSTOMER */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-white dark:bg-emerald-950/20 shadow-xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {esCuotas && tipoAbono === 'CUOTA'
                ? `¡Cuota 1 de ${cuotasTotal} Confirmada por Culqi Express!`
                : '¡Pago Total Cancelado y Confirmado por Culqi Express!'}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ¡Bienvenido a INBESTIGA.TESIS!
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Hemos confirmado el abono de <strong className="text-slate-900 dark:text-white">S/ {montoAPagar.toFixed(2)}</strong> para la cotización{' '}
              <strong className="font-mono text-sky-700 dark:text-sky-400">{cotizacion.codigoCotizacion}</strong>.
              {esCuotas && tipoAbono === 'CUOTA' && (
                <span className="block mt-1 font-semibold text-purple-700 dark:text-purple-300">
                  Saldo pendiente para la 2da cuota: S/ {saldoRestante.toFixed(2)} (dentro de 30 días).
                </span>
              )}
            </p>
          </div>

          {/* Customer & Advisor Details Card */}
          <div className="glass-card max-w-xl mx-auto p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-left space-y-3 text-xs bg-slate-50 dark:bg-slate-900/60">
            <h3 className="font-heading font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>Detalle de tu Asesoría Académica</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div className="truncate">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Estudiante:</span>
                <strong className="text-slate-900 dark:text-white">{cotizacion.estudiante.nombres}</strong>
              </div>
              <div className="truncate">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Asesor Asignado:</span>
                <strong className="text-purple-700 dark:text-purple-300">{pagoResultado?.resultadoCustomer?.asesorAsignado || 'Dr. Roberto Carlos Mendoza (Metodólogo Senior)'}</strong>
              </div>
              <div className="truncate">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Estado Funnel:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">CUSTOMER (Activo)</strong>
              </div>
              <div className="truncate">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Primera Sesión:</span>
                <strong className="text-slate-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Próximos 3 días a las 5:00 PM</span>
                </strong>
              </div>
            </div>

            {(pagoResultado?.resultadoCustomer?.primeraSesion?.enlace || yaPagado) && (
              <div className="pt-2">
                <a
                  href={pagoResultado?.resultadoCustomer?.primeraSesion?.enlace || 'https://meet.google.com/inb-tesis-asesoria'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-600/30 dark:hover:bg-blue-600/50 text-blue-800 dark:text-sky-300 border border-blue-300 dark:border-blue-500/40 font-bold flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Video className="w-4 h-4 text-blue-700 dark:text-sky-400" />
                  <span>Sala de Reunión Virtual (Google Meet)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/admin/comprobantes"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md hover:from-purple-600 hover:to-indigo-500 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Ver Boleta Electrónica Oficial</span> <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/customers"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-md hover:from-blue-600 hover:to-sky-500 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Ver en Bitácora de Tesistas</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Pantalla de Checkout Formal */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Columna Izquierda: Formulario de Pago */}
          <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-md bg-white dark:bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Pasarela Culqi / Oficial</span>
                <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white">Confirmar y Realizar Pago</h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span>Cifrado Culqi 256-bit</span>
              </div>
            </div>

            {/* Detección y Selección de Modalidad de Cuotas */}
            {esCuotas && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-300 dark:border-purple-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs">
                      {cuotasTotal}
                    </span>
                    <span className="font-heading font-black text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                      Plan en {cuotasTotal} Cuotas Detectado
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    Elección del Tesista
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  El estudiante pactó pagar la asesoría de <strong className="text-slate-900 dark:text-white">S/ {totalContrato.toFixed(2)}</strong> en <strong className="text-purple-700 dark:text-purple-300">{cuotasTotal} cuotas de S/ {montoPorCuota.toFixed(2)}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTipoAbono('CUOTA')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      tipoAbono === 'CUOTA'
                        ? 'bg-white dark:bg-slate-900 border-purple-600 ring-2 ring-purple-500/40 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/40 border-purple-200 dark:border-purple-900 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Opción 1 • Recomendada
                      </span>
                      {tipoAbono === 'CUOTA' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="font-heading font-black text-base text-slate-900 dark:text-white mt-1">
                      Pagar Cuota 1: S/ {montoPorCuota.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Activa hoy tu asesoría. Saldo de S/ {saldoRestante.toFixed(2)} a 30 días.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoAbono('TOTAL')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      tipoAbono === 'TOTAL'
                        ? 'bg-white dark:bg-slate-900 border-blue-600 ring-2 ring-blue-500/40 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/40 border-purple-200 dark:border-purple-900 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                        Opción 2 • Liquidación Total
                      </span>
                      {tipoAbono === 'TOTAL' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                      )}
                    </div>
                    <div className="font-heading font-black text-base text-slate-900 dark:text-white mt-1">
                      Pagar Total: S/ {totalContrato.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      100% Cancelado en una sola transacción. Sin cuotas pendientes.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Selecciona el Método de Pago:</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodo('YAPE')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    metodo === 'YAPE'
                      ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 text-purple-900 dark:text-white shadow-sm ring-1 ring-purple-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold">Yape Directo (Culqi)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('CARD')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    metodo === 'CARD'
                      ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-900 dark:text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold">Tarjeta (Débito/Crédito)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('TRANSFER')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    metodo === 'TRANSFER'
                      ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-900 dark:text-white shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">Transferencia BCP</span>
                </button>
              </div>
            </div>

            {/* Input según método */}
            <form onSubmit={handlePagar} className="space-y-4">
              {metodo === 'YAPE' ? (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">Pago Directo con Yape (Vía Culqi)</span>
                      <span className="text-[11px] text-purple-700 dark:text-purple-400">Sin escanear QR. Débito instantáneo y seguro en tu app.</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded font-bold border border-purple-300 dark:border-purple-700">
                      CULQI + YAPE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Celular Yape</label>
                      <input
                        type="tel"
                        value={telefonoYape}
                        onChange={(e) => setTelefonoYape(e.target.value)}
                        placeholder="Ej. 926 619 777"
                        required
                        className="w-full bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-800/60 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Código de Aprobación (OTP)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={codigoAprobacion}
                        onChange={(e) => setCodigoAprobacion(e.target.value)}
                        placeholder="6 dígitos (ej. 491823)"
                        required
                        className="w-full bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-800/60 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Instrucción visual para obtener el código de aprobación */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/50 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-900 dark:text-purple-300">¿Cómo generar tu Código de Aprobación?</strong>
                      <p className="mt-0.5">Abre tu app Yape ➔ pulsa el menú superior (☰) ➔ pulsa <strong>&quot;Código de aprobación&quot;</strong>. Es un PIN de 6 dígitos que expira en 90 segundos para garantizar tu seguridad.</p>
                    </div>
                  </div>

                  {/* Toggle QR Alternativo */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setMostrarQrAlternativo(!mostrarQrAlternativo)}
                      className="text-[11px] text-purple-700 dark:text-purple-400 hover:underline font-semibold"
                    >
                      {mostrarQrAlternativo ? '▲ Ocultar QR tradicional' : '▼ ¿Prefieres escanear QR tradicional de Yape?'}
                    </button>

                    {mostrarQrAlternativo && (
                      <div className="mt-3 flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                        <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center border border-slate-200 shrink-0">
                          <QrCode className="w-14 h-14 text-black" />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">INBESTIGA PERÚ S.A.C.</p>
                          <p className="text-slate-500 dark:text-slate-400">RUC: 20601234567</p>
                          <p className="font-mono text-purple-700 dark:text-purple-400 font-black text-sm">926 619 777</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Número de Tarjeta</label>
                    <input
                      type="text"
                      value={numeroTarjeta}
                      onChange={(e) => setNumeroTarjeta(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vencimiento</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CVC</label>
                      <input
                        type="text"
                        defaultValue="888"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {processing ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>
                  Confirmar y Pagar S/ {montoAPagar.toFixed(2)}
                  {esCuotas && tipoAbono === 'CUOTA' ? ` (Cuota 1 de ${cuotasTotal})` : ' (Totalidad)'}
                </span>
              </button>
            </form>
          </div>

          {/* Columna Derecha: Resumen de Cotización */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-md bg-white dark:bg-slate-900/60 self-start">
            <h2 className="font-heading font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Resumen de la Cotización
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Código Oficial:</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{cotizacion.codigoCotizacion}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Servicio:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right truncate">{cotizacion.servicio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Modalidad:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {esCuotas ? `${cuotasTotal} cuotas de S/ ${montoPorCuota.toFixed(2)}` : 'Pago Único Contado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plazo Asesoría:</span>
                <span className="text-slate-700 dark:text-slate-300">{cotizacion.plazoEntregaDias} días</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Precio Base:</span>
                <span>S/ {cotizacion.subtotal}</span>
              </div>
              {cotizacion.descuento > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Descuento Negociado:</span>
                  <span>- S/ {cotizacion.descuento}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Total del Contrato:</span>
                <span>S/ {totalContrato.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                <span>Monto a Pagar Hoy:</span>
                <span className="text-blue-700 dark:text-sky-300">S/ {montoAPagar.toFixed(2)}</span>
              </div>
              {esCuotas && tipoAbono === 'CUOTA' && (
                <div className="flex justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800/60">
                  <span>Saldo Restante (Cuota 2):</span>
                  <span>S/ {saldoRestante.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-900 dark:text-slate-300">Titular del Contrato:</strong>
              </p>
              <p className="truncate">{cotizacion.estudiante.nombres}</p>
              <p className="truncate">{cotizacion.estudiante.carrera} • {cotizacion.estudiante.universidad}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

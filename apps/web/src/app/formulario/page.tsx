'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase,
  DollarSign,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function FormularioPage() {
  const [loading, setLoading] = useState(false);
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [resultado, setResultado] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    whatsapp: '',
    email: '',
    universidad: 'Universidad Nacional de Trujillo',
    universidadId: '',
    carrera: 'Ingeniería de Sistemas',
    carreraId: '',
    ciclo: '10mo ciclo',
    tipoInvestigacion: 'TRABAJO_INVESTIGACION_BACHILLER',
    consentimientoWhatsapp: true,
    situacionLaboral: 'TRABAJA_TIEMPO_COMPLETO',
    plazoDefinidoDias: 60,
    presupuestoAprox: 2000,
    dolorPrincipal: 'Falta de tiempo y asesor de tesis no brinda feedback oportuno',
    softwareRequerido: 'PYTHON',
    descargoLeadMagnet: true,
  });

  useEffect(() => {
    api
      .getCatalogos()
      .then((data) => {
        if (data?.universidades) setUniversidades(data.universidades);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'ciclo') {
      // Sugerencia implícita automática según ciclo académico (Ley Universitaria 30220):
      // - 9no y 10mo ciclo: Estudiante aún cursando pregrado -> Trabajo de Investigación para Grado de Bachiller
      // - Bachiller o Egresado: Ya culminó pregrado / tiene bachiller -> Tesis de Grado para Título Profesional
      let sugerenciaTipo = formData.tipoInvestigacion;
      if (value === '9no ciclo' || value === '10mo ciclo') {
        sugerenciaTipo = 'TRABAJO_INVESTIGACION_BACHILLER';
      } else if (value === 'BACHILLER' || value === 'EGRESADO') {
        sugerenciaTipo = 'TESIS';
      }
      setFormData((prev) => ({
        ...prev,
        ciclo: value,
        tipoInvestigacion: sugerenciaTipo,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.submitFormulario(formData);
      setResultado(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-sky-400 text-xs font-bold border border-blue-200 dark:border-blue-500/20 shadow-xs">
          <GraduationCap className="w-4 h-4" />
          <span>Postulación y Diagnóstico Académico</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
          Formulario de Registro de Tesis
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Completa los datos de tu investigación para calcular tu Lead Score y recibir una propuesta personalizada por WhatsApp.
        </p>
      </div>

      {resultado ? (
        /* Result & Scoring Breakdown Card */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-300 dark:border-emerald-500/40 shadow-xl space-y-6 animate-fade-in bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/40 shrink-0">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                ¡Registro Completado con Éxito!
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {resultado.nombres} {resultado.apellidos}
              </h2>
            </div>
          </div>

          {/* Score Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lead Score Calculado</p>
                <p className="font-heading text-3xl font-black text-slate-900 dark:text-white">
                  {resultado.leadScore} <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/ 100</span>
                </p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${
                  resultado.esLead
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-500/40'
                }`}
              >
                {resultado.estadoFunnel}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estado del Funnel IMPULSE</p>
              <p className="font-heading text-sm font-bold text-sky-700 dark:text-sky-400 mt-1">
                {resultado.esLead ? '✓ Calificado para Negociación IA' : 'Prospecto en Descubrimiento'}
              </p>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Criterios Ponderados del Lead Score:
            </h3>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {resultado.explicacionScore?.map((exp: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="break-words">{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4">
            <Link
              href="/admin/buyers"
              className="flex-1 text-center py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Ver en Panel de BUYERS (Demostración)</span> <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setResultado(null)}
              className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Registrar Otro Estudiante
            </button>
          </div>
        </div>
      ) : (
        /* Form Content */
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-md bg-white dark:bg-slate-900/60">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {/* Sección 1: Datos Personales Obligatorios */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <Sparkles className="w-4 h-4" />
              <span>1. Datos del Estudiante (Obligatorios)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombres *</label>
                <input
                  type="text"
                  name="nombres"
                  required
                  placeholder="Ej. Ana Lucía"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  required
                  placeholder="Ej. Pérez Mendoza"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp (con código de país) *</label>
                <input
                  type="text"
                  name="whatsapp"
                  required
                  placeholder="Ej. 51949123456"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Recibirás el contacto directo por este número</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Institucional / Personal *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ana.perez@unt.edu.pe"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Perfil Académico Obligatorio */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <GraduationCap className="w-4 h-4" />
              <span>2. Perfil Académico e Investigación (Obligatorio)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Universidad *</label>
                <select
                  name="universidad"
                  value={formData.universidad}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="Universidad Nacional de Trujillo">Universidad Nacional de Trujillo (UNT)</option>
                  <option value="Universidad César Vallejo">Universidad César Vallejo (UCV)</option>
                  <option value="Universidad Privada Antenor Orrego">Universidad Privada Antenor Orrego (UPAO)</option>
                  <option value="Universidad Nacional Mayor de San Marcos">UNMSM (Lima)</option>
                  <option value="Pontificia Universidad Católica del Perú">PUCP (Lima)</option>
                  <option value="Otra Universidad">Otra Universidad</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Carrera Profesional *</label>
                <input
                  type="text"
                  name="carrera"
                  required
                  placeholder="Ej. Ingeniería de Sistemas"
                  value={formData.carrera}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ciclo Académico *</label>
                <select
                  name="ciclo"
                  value={formData.ciclo}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="9no ciclo">9no ciclo</option>
                  <option value="10mo ciclo">10mo ciclo (Próximo a egresar)</option>
                  <option value="EGRESADO">Egresado (Pendiente de Bachiller o Título)</option>
                  <option value="BACHILLER">Bachiller (Postulando a Título Profesional)</option>
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Población objetivo: estudiantes universitarios de 9no/10mo ciclo y egresados</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Investigación / Grado Requerido *</label>
                <select
                  name="tipoInvestigacion"
                  value={formData.tipoInvestigacion}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="TRABAJO_INVESTIGACION_BACHILLER">Trabajo de Investigación (Para Grado de Bachiller)</option>
                  <option value="PLAN_DE_TESIS">Plan / Proyecto de Tesis (Para Título Profesional)</option>
                  <option value="TESIS">Tesis de Grado Completa (Para Título Profesional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 3: Datos de Diagnóstico */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>3. Diagnóstico de Necesidades (Opcionales / Suman Score)</span>
              </h3>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                +45 pts posibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> <span>Situación Laboral</span>
                </label>
                <select
                  name="situacionLaboral"
                  value={formData.situacionLaboral}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="TRABAJA_TIEMPO_COMPLETO">Trabaja a tiempo completo</option>
                  <option value="MEDIO_TIEMPO">Trabaja a medio tiempo</option>
                  <option value="SOLO_ESTUDIA">Dedicación exclusiva al estudio</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> <span>Plazo Deseado (en días)</span>
                </label>
                <input
                  type="number"
                  name="plazoDefinidoDias"
                  value={formData.plazoDefinidoDias}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> <span>Presupuesto Estimado (PEN S/)</span>
                </label>
                <input
                  type="number"
                  name="presupuestoAprox"
                  value={formData.presupuestoAprox}
                  onChange={handleChange}
                  placeholder="2000"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-slate-400" /> <span>Software Requerido</span>
                </label>
                <select
                  name="softwareRequerido"
                  value={formData.softwareRequerido}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="SPSS">SPSS (Estadística Social/Salud)</option>
                  <option value="PYTHON">Python / R (Data Science)</option>
                  <option value="ATLAS_TI">Atlas.ti (Cualitativa)</option>
                  <option value="STATA">Stata (Econometría)</option>
                  <option value="EXCEL">Excel Avanzado</option>
                  <option value="NINGUNO">Ninguno / Por definir</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Principal Dolor o Dificultad en tu Tesis
                </label>
                <textarea
                  name="dolorPrincipal"
                  rows={2}
                  value={formData.dolorPrincipal}
                  onChange={handleChange}
                  placeholder="Ej. El asesor no responde correos, no entiendo la estadística inferencial..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Consentimiento WhatsApp */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consentimientoWhatsapp"
                checked={formData.consentimientoWhatsapp}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Acepto recibir orientaciones metodológicas y propuestas personalizadas por WhatsApp por parte de INBESTIGA.TESIS (+15 pts Lead Score).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="descargoLeadMagnet"
                checked={formData.descargoLeadMagnet}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Deseo descargar gratis la "Guía Definitiva de Matriz de Consistencia y Anti-Plagio" (+15 pts Lead Score).
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Enviar Formulario y Calcular Lead Score</span>
          </button>
        </form>
      )}
    </div>
  );
}

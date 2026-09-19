import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  FileCheck,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      etapa: 'UNIVERSO',
      titulo: 'Descubrimiento',
      desc: 'Difusión de valor académico e interacción con anuncios de investigación.',
      lightColor: 'border-slate-200 bg-slate-50/80 text-slate-800',
      darkColor: 'dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
      badge: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      etapa: 'BUYER',
      titulo: 'Captación',
      desc: 'El estudiante registra su necesidad, carrera, universidad y dificultades.',
      lightColor: 'border-blue-200 bg-blue-50/70 text-blue-950',
      darkColor: 'dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    },
    {
      etapa: 'LEAD',
      titulo: 'Calificación',
      desc: 'El sistema calcula el Lead Score (0-100). Si supera 70/100 califica para negociación.',
      lightColor: 'border-sky-200 bg-sky-50/70 text-sky-950',
      darkColor: 'dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    },
    {
      etapa: 'PAYER',
      titulo: 'Contratación',
      desc: 'Negociación asistida por IA y confirmación segura de pago mediante pasarela real.',
      lightColor: 'border-emerald-200 bg-emerald-50/70 text-emerald-950',
      darkColor: 'dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    {
      etapa: 'CUSTOMER',
      titulo: 'Atención & Asesoría',
      desc: 'Asignación de asesor con grado académico y calendarización de sesiones activas.',
      lightColor: 'border-purple-200 bg-purple-50/70 text-purple-950',
      darkColor: 'dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-200',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    },
  ];

  const servicios = [
    {
      titulo: 'Asesoría Integral de Tesis',
      desc: 'Acompañamiento desde el tema hasta la sustentación con rigurosidad metodológica y soporte continuo.',
      precio: 'Desde S/ 2,200',
      badge: 'Más Solicitado',
      icono: Award,
    },
    {
      titulo: 'Elaboración de Plan de Tesis',
      desc: 'Diseño de matriz de consistencia, operacionalización de variables y delimitación según tu universidad.',
      precio: 'Desde S/ 1,200',
      badge: 'Pregrado',
      icono: FileCheck,
    },
    {
      titulo: 'Análisis Estadístico Especializado',
      desc: 'Tratamiento de datos en SPSS, Python o R. Pruebas inferenciales, gráficos APA 7ma edición.',
      precio: 'Desde S/ 850',
      badge: 'Rápido (2 sem)',
      icono: TrendingUp,
    },
    {
      titulo: 'Redacción de Artículo Científico',
      desc: 'Estructuración según formato IMRyD y postulación a revistas indexadas Scopus / Scielo.',
      precio: 'Desde S/ 1,800',
      badge: 'Indexación',
      icono: BookOpen,
    },
  ];

  return (
    <div className="space-y-16 py-4 sm:py-6 animate-fade-in">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-6 sm:pt-10 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-sky-400 text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span>Metodología IMPULSE de Inteligencia de Negocios</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Acelera tu{' '}
          <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Titulación Universitaria
          </span>{' '}
          con Rigor Científico
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed break-words">
          Plataforma de alta tecnología para la captación, calificación, negociación y asesoría personalizada de tesis con acompañamiento de Doctores y Magísteres especializados.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <Link
            href="/formulario"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <span>Postular mi Proyecto de Tesis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/buyers"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>Panel de Demostración (Docente)</span>
          </Link>
        </div>
      </section>

      {/* IMPULSE Funnel Pipeline Visualization */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 bg-white dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="min-w-0">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Arquitectura del Funnel Metodológico IMPULSE</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Ciclo de vida de conversión de extremo a extremo</p>
          </div>
          <span className="self-start sm:self-center text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold">
            5 Etapas Normalizadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.etapa}
              className={`p-4 rounded-xl border ${step.lightColor} ${step.darkColor} space-y-2 flex flex-col justify-between shadow-xs min-w-0`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider mb-1.5">
                  <span>ETAPA {idx + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${step.badge}`}>{step.etapa}</span>
                </div>
                <h3 className="font-heading font-bold text-sm truncate">{step.titulo}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 break-words">{step.desc}</p>
              </div>
              <div className="pt-2 flex items-center text-[10px] text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-1 shrink-0" />
                <span>Automatizado por sistema</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Líneas de Asesoría Especializada
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Planes adaptados a las exigencias metodológicas de universidades públicas y privadas del Perú
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {servicios.map((srv) => {
            const Icon = srv.icono;
            return (
              <div
                key={srv.titulo}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md min-w-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-sky-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/40 group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 truncate">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-sky-300 transition-colors break-words">
                    {srv.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-heading font-black text-sm text-blue-700 dark:text-sky-300 shrink-0">{srv.precio}</span>
                  <Link
                    href="/formulario"
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Postular</span> <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Academic Credentials */}
      <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-md bg-white dark:bg-slate-900/60">
        <div className="space-y-2 min-w-0">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-sky-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/40">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Doctores y Magísteres</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Asesores con publicaciones indexadas en Scopus y dilatada trayectoria docente en investigación.
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Anti-Plagio Riguroso</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Verificación de similitud Turnitin garantizada bajo umbrales institucionales (&lt;20%) y citación APA 7ma ed.
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/40">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Negociación y Soporte IA</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            Atención ágil mediante WhatsApp oficial integrado, respuestas inmediatas y facilidades de pago en cuotas.
          </p>
        </div>
      </section>
    </div>
  );
}

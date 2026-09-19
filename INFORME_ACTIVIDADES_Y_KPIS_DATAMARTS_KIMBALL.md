# UNIVERSIDAD NACIONAL DE TRUJILLO
## FACULTAD DE INGENIERÍA — ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS
### CURSO: INTELIGENCIA DE NEGOCIOS (2026-II)
**Docente Evaluador:** Dr. Mendoza Rivera Ricardo Dario  
**Proyecto:** INBESTIGA.TESIS — Servicio Especializado de Aceleración y Asesoría de Tesis Universitaria  
**Tema:** Especificación de Actividades de Negocio, Indicadores Clave (KPIs) y Arquitectura Dimensional por Data Marts (Metodología Ralph Kimball)

---

## 1. RESUMEN ARQUITECTÓNICO Y JUSTIFICACIÓN METODOLÓGICA

En concordancia con las directrices académicas impartidas por el docente **Dr. Mendoza Rivera Ricardo Dario**, el sistema analítico ha evolucionado desde una estructura monolítica centralizada hacia una **Arquitectura de 4 Data Marts Orientados a Procesos de Negocio**, interconectados a través de **Dimensiones Conformadas (Conformed Dimensions)** según el estándar mundial de **Ralph Kimball**.

Cada fase del embudo metodológico **IMPULSE** (`Buyers ➔ Leads ➔ Payers ➔ Customers`) cuenta con su propio Data Mart desacoplado, sus tablas de hechos atómicas, sus dimensiones específicas, sus vistas analíticas de KPIs con semaforización dinámica (🟢 Verde, 🟡 Amarillo, 🔴 Rojo) y sus procedimientos ETL automatizados.

### 1.1. Matriz de Procesos del Negocio (Kimball Bus Matrix)

| Proceso de Negocio / Data Mart | Esquema Físico SQL | Tabla de Hechos Central | DIM_TIEMPO | DIM_UNIVERSIDAD | DIM_CARRERA | DIM_SERVICIO | DIM_ESTUDIANTE | Dimensiones Propias del Mart |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Fase 1: Captación & Marketing** | `dm_buyers` | `FACT_CAPTACION` | **X** | **X** | **X** | | **X** | `DIM_CANAL`, `DIM_CAMPANA`, `DIM_UBICACION` |
| **Fase 2: Negociación con IA** | `dm_leads` | `FACT_NEGOCIACION` | **X** | **X** | **X** | **X** | **X** | `DIM_OBJECION`, `DIM_ESTADO_ETAPA` |
| **Fase 3: Cobranza y Pasarela** | `dm_payers` | `FACT_COBRANZA` | **X** | **X** | **X** | **X** | **X** | `DIM_METODO_PAGO`, `DIM_PASARELA` |
| **Fase 4: Atención & Bitácora** | `dm_customers` | `FACT_ATENCION` | **X** | **X** | **X** | **X** | **X** | `DIM_ASESOR`, `DIM_ESTADO_SERVICIO` |

---

## 2. FASE 1 — BUYERS: EL CLIENTE Y LA CAPTACIÓN

### 2.1. Objetivo de la Fase
Captar a estudiantes de los últimos ciclos (9.º y 10.º ciclo) y egresados de universidades peruanas mediante estrategias multicanal (Meta Ads, TikTok Ads, Google Search, Blog SEO, Referidos), registrar sus datos de contacto y evaluar de forma automatizada su potencial académico/comercial mediante un algoritmo ponderado de **Lead Scoring** (0 a 100 puntos), promoviendo a la fase de negociación a aquellos con puntaje $\ge 70$.

### 2.2. Actividades del Proceso de Negocio (Matriz de Actividades)

| N.° Actividad | Nombre de la Actividad | Descripción Operacional | Cliente / Usuario Objetivo | Actividad del Agente IA (Marketing) | Entradas del Proceso | Salidas del Proceso |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-1.1** | **Segmentación de Audiencia** | Identificación de facultades, carreras y ciclo académico de alta demanda de titulación (UNT, UPAO, UCV, UPN). | Tesistas de 9.º y 10.º ciclo y egresados. | Asigna etiquetas de carrera, universidad y nivel de dolor académico. | Datos de segmentación demográfica y publicitaria. | Audiencias personalizadas en canales publicitarios. |
| **ACT-1.2** | **Difusión y Publicidad Multicanal** | Lanzamiento y monitoreo de campañas pagadas (Meta, TikTok, Google) y orgánicas (SEO). | Estudiantes que buscan solucionar su tesis con urgencia. | Supervisa la entrega de contenidos e interacción en anuncios. | Presupuesto publicitario (`CAMPANA_MARKETING`). | Clics, visitas e interacciones registradas. |
| **ACT-1.3** | **Distribución de Lead Magnets** | Entrega de recursos de valor gratuitos (Plantillas de Tesis, Guías APA 7, Matrices de Consistencia). | Tesistas con dudas metodológicas iniciales. | Envía el recurso descargable vía WhatsApp Webhook tras registro. | Enlace de descarga y número de WhatsApp. | Descargas completadas (`DESCARGA_RECURSO`). |
| **ACT-1.4** | **Captura de Formularios (Landing Page)** | Registro estructurado de datos de perfil, tema de tesis, ciclo, universidad y teléfono. | Visitante que decide postular al servicio de aceleración. | Valida número de teléfono para evitar duplicados y normaliza texto. | Formulario web enviado (`BUYER_PERSONA`). | Registro atómico en base de datos (`id_buyer`). |
| **ACT-1.5** | **Calificación y Lead Scoring** | Evaluación algorítmica de 7 factores: ciclo (20 pts), plazo (15 pts), tipo de investigación (15 pts), situación laboral (10 pts), nivel de dolor (10 pts), confirmación WhatsApp (15 pts), lead magnet (15 pts). | Buyer recién registrado. | Ejecuta `ScoringService` en tiempo real; si Score $\ge 70$, promueve a `LEAD`. | Datos del buyer persona. | `leadScore` (0–100) y creación de registro `LEAD`. |

### 2.3. Preguntas de Negocio del Data Mart `dm_buyers`
1. ¿Cuál es la tasa de conversión global de formularios recibidos (Buyers) a prospectos calificados (Leads)?
2. ¿Qué campañas publicitarias presentan el menor Costo por Lead (CPL) y generan el mayor retorno?
3. ¿Cuánto tiempo tarda en promedio el Agente IA de Marketing en emitir la primera respuesta tras el llenado del formulario?
4. ¿Qué canales de captación (TikTok, Meta, Google, Orgánico) aportan prospectos con mayor Lead Score y menor costo?

### 2.4. Matriz Consolidada de Indicadores (KPIs) — Data Mart `inbestiga_dm_buyers`

| N.° KPI | Nombre del KPI | Objetivo de Negocio | Fórmula Matemática | Frecuencia | Metas / Semáforo | Dimensiones | Origen OLTP (`inbestiga_db`) | Vista Analítica en Data Mart |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **KPI-1.1** | **Tasa de Conversión Buyer ➔ Lead** | Medir la proporción de registros que califican como prospectos viables ($\text{Score} \ge 70$ o avance a etapas comerciales). | $\left(\frac{\text{Total Leads Calificados}}{\text{Total Buyers Captados}}\right) \times 100$ | Diaria / Continua | 🟢 $\ge 15\%$<br>🟡 $8\% - 14.9\%$<br>🔴 $< 8\%$ | Tiempo, Universidad, Carrera, Canal | `BUYER.leadScore`, `BUYER.estadoFunnel` | `vw_kpi_buyers_conversion`<br>Hecho: `FACT_CAPTACION` |
| **KPI-1.2** | **Costo por Lead (CPL) por Campaña** | Evaluar la eficiencia económica del presupuesto publicitario asignado a cada campaña. | $\frac{\text{Presupuesto Total Campaña}}{\text{N.° de Leads Calificados Generados}}$ | Semanal / Mensual | 🟢 $\le \text{S/ } 8.00$<br>🟡 $\text{S/ } 8.01 - 12.00$<br>🔴 $> \text{S/ } 12.00$ | Campaña, Canal | `CAMPAÑA.presupuesto`, `BUYER` | `vw_kpi_buyers_cpl`<br>Dimensión: `DIM_CAMPANA` |
| **KPI-1.3** | **Tiempo Promedio de 1.ª Respuesta del Agente IA** | Medir la agilidad de la primera respuesta automatizada tras el mensaje inicial del estudiante por WhatsApp. | $\frac{\sum (\text{Hora Respuesta Bot} - \text{Hora Mensaje Cliente})}{\text{N.° Interacciones Evaluadas}}$ | Diaria / Continua | 🟢 $\le 120\text{ s}$ ($\le 2\text{ min}$)<br>🟡 $121 - 300\text{ s}$<br>🔴 $> 300\text{ s}$ | Canal, Tiempo | `CONVERSACION`, `MENSAJE.fechaHora` (IN vs OUT) | `vw_kpi_buyers_tiempo_primera_respuesta` |
| **KPI-1.4** | **Promedio de Interacciones por Buyer** | Cuantificar el nivel de contacto previo a la calificación del prospecto. | $\frac{\sum \text{Interacciones Registradas}}{\text{Total Buyers Captados}}$ | Semanal | 🟢 $\ge 4.0$<br>🟡 $2.0 - 3.9$<br>🔴 $< 2.0$ | Canal, Universidad | `INTERACCION.buyerId`, `BUYER` | `vw_kpi_buyers_interacciones` |
| **KPI-1.5** | **Rendimiento por Canal de Adquisición** | Identificar qué fuentes (Meta Ads, Google, TikTok, Orgánico, Referidos) atraen prospectos de mayor valor. | $\left(\frac{\text{Leads del Canal}}{\text{Total Buyers del Canal}}\right) \times 100$ | Mensual | 🟢 $\ge 60\%$<br>🟡 $40\% - 59.9\%$<br>🔴 $< 40\%$ | Canal, Carrera | `CANAL`, `BUYER` | `vw_kpi_buyers_por_canal`<br>Dimensión: `DIM_CANAL` |

> **Nota metodológica del Data Mart `dm_buyers`:**
> 1. **Cálculo del Tiempo de Respuesta:** Se calcula estrictamente sobre compradores que iniciaron contacto en mensajería (`tiempo_primera_respuesta_seg IS NOT NULL`). No se imputan valores artificiales (p. ej. 45 s) a quienes solo llenaron formulario web pero aún no chatean.
> 2. **Criterio de Lead Calificado:** Un estudiante califica a lead si su algoritmo de Scoring arroja $\text{leadScore} \ge 70$ o si el funnel comercial avanzó a `LEAD`, `PAYER` o `CUSTOMER`.

---

## 3. FASE 2 — LEADS: CONVERSIÓN Y NEGOCIACIÓN CON IA

### 3.1. Objetivo de la Fase
Tomar a los prospectos calificados ($\text{Score} \ge 70$), diagnosticar el estado exacto de su proyecto de tesis mediante el Agente Negociador en WhatsApp, estructurar una propuesta económica personalizada, resolver objeciones (precio, tiempo, desconfianza, modalidad) y aplicar reglas comerciales automatizadas (descuento máximo del 10% al 15% o financiamiento en 2 cuotas) para lograr el compromiso de pago.

### 3.2. Actividades del Proceso de Negocio (Matriz de Actividades)

| N.° Actividad | Nombre de la Actividad | Descripción Operacional | Cliente / Usuario Objetivo | Actividad del Agente IA (Negociador) | Entradas del Proceso | Salidas del Proceso |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-2.1** | **Diagnóstico Metodológico** | Recopilación del estado del proyecto: título aprobado, marco teórico, instrumentos, recolección o defensa. | Lead con Score $\ge 70$. | Pregunta mediante árbol de decisión el avance y plazos universitarios. | Respuestas del estudiante por chat. | Ficha de diagnóstico metodológico (`DIAGNOSTICO`). |
| **ACT-2.2** | **Generación de Propuesta Comercial** | Cotización según complejidad, carrera y urgencia (Tesis Completa, Plan de Tesis o Desarrollo Estadístico). | Lead diagnosticado. | Aplica el tarifario base y genera la cotización formal con código único. | Tipo de servicio y urgencia. | Propuesta comercial formal (`PROPUESTA`). |
| **ACT-2.3** | **Gestión de Objeciones con IA** | Identificación de la barrera de cierre: "está muy caro", "no tengo tiempo", "tengo miedo de ser estafado", "necesito consultar con mis padres". | Lead con dudas o resistencia a pagar. | Clasifica la objeción y despliega contra-argumento estructurado (testimonios, garantías, cuotas). | Mensaje de objeción del estudiante. | Registro de objeción resuelta (`OBJECION`). |
| **ACT-2.4** | **Negociación y Reglas Comerciales** | Otorgamiento de incentivos controlados: descuento por pronto pago (máx. 10%) o división en 2 partes. | Lead en fase de decisión final. | Evalúa reglas comerciales y genera enlace de pasarela con descuento auditado. | Intención de compra del lead. | Propuesta aprobada y orden de pago lista. |
| **ACT-2.5** | **Escalamiento a Asesor Humano** | Transferencia del chat a un asesor senior cuando el lead solicita condiciones fuera de regla o requiere validación metodológica experta. | Lead con objeción no estándar. | Notifica al supervisor humano y pausa las respuestas automáticas del bot. | Detección de intención compleja. | Transferencia de custodia del chat (`CONVERSACION.estadoEtapa = 'HUMAN_ESCALATION'`). |

### 3.3. Preguntas de Negocio del Data Mart `dm_leads`
1. ¿Cuál es la tasa de conversión de prospectos calificados (Leads) a clientes que formalizan su pago (Payers)?
2. ¿Qué porcentaje de estudiantes con dudas u objeciones son recuperados exitosamente por el bot de IA?
3. ¿Cuánto tiempo dura en promedio el ciclo de cierre de una venta desde el primer mensaje hasta la confirmación de la cotización?
4. ¿Qué porcentaje de casos requieren intervención humana frente al total de negociaciones automáticas?
5. ¿Cuál es el descuento promedio otorgado por el sistema y en qué universidades se concede con mayor frecuencia?

### 3.4. Matriz Consolidada de Indicadores (KPIs) — Data Mart `inbestiga_dm_leads`

| N.° KPI | Nombre del KPI | Objetivo de Negocio | Fórmula Matemática | Frecuencia | Metas / Semáforo | Dimensiones | Origen OLTP (`inbestiga_db`) | Vista Analítica en Data Mart |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **KPI-2.1** | **Tasa de Conversión Lead ➔ Payer** | Medir la efectividad del Agente Negociador en el cierre comercial. | $\left(\frac{\text{Leads Convertidos a Pago}}{\text{Total Leads Negociados}}\right) \times 100$ | Diaria / Semanal | 🟢 $\ge 18\%$<br>🟡 $10\% - 17.9\%$<br>🔴 $< 10\%$ | Tiempo, Universidad, Carrera, Servicio | `LEAD`, `CONVERSACION.estadoEtapa` | `vw_kpi_leads_conversion`<br>Hecho: `FACT_NEGOCIACION` |
| **KPI-2.2** | **Tasa de Recuperación de Objeciones** | Evaluar la persuasión del bot ante objeciones de precio, tiempo o confianza. | $\left(\frac{\text{Objeciones Convertidas a Pago}}{\text{Total Leads con Objeción}}\right) \times 100$ | Semanal | 🟢 $\ge 25\%$<br>🟡 $15\% - 24.9\%$<br>🔴 $< 15\%$ | Objeción, Universidad, Tiempo | `OBJECION.tipo`, `FACT_NEGOCIACION` | `vw_kpi_leads_recuperacion_objeciones`<br>Dimensión: `DIM_OBJECION` |
| **KPI-2.3** | **Tiempo Promedio de Cierre de Negociación** | Medir la duración del ciclo consultivo comercial en horas desde el primer contacto hasta el cierre. | $\frac{\sum (\text{Fecha Cierre} - \text{Fecha Inicio})}{\text{N.° Ventas Cerradas}}$ | Semanal | 🟢 $\le 72\text{ horas}$ ($\le 3\text{ días}$)<br>🟡 $72.1 - 120\text{ horas}$<br>🔴 $> 120\text{ horas}$ | Servicio, Tiempo | `CONVERSACION.fechaInicio`, `fechaUltimaActividad` | `vw_kpi_leads_tiempo_negociacion` |
| **KPI-2.4** | **Tasa de Escalamiento a Asesor Humano** | Monitorear el nivel de autonomía del bot de IA y prevenir saturación humana. | $\left(\frac{\text{Casos Escalados a Humano}}{\text{Total Negociaciones IA}}\right) \times 100$ | Diaria | 🟢 $15\% - 20\%$<br>🟡 $10\% - 14.9\%$ o $21\% - 30\%$<br>🔴 $< 10\%$ o $> 30\%$ | Carrera, Tiempo | `CONVERSACION.estadoEtapa` (`HUMAN_ESCALATION`) | `vw_kpi_leads_escalamiento` |
| **KPI-2.5** | **Descuento Promedio Otorgado (%)** | Proteger el margen del negocio evitando concesiones comerciales excesivas. | $\frac{\sum \text{Descuento Aplicado (\%)}}{\text{Total Propuestas con Descuento}}$ | Mensual | 🟢 $\le 10.0\%$<br>🟡 $10.1\% - 15.0\%$<br>🔴 $> 15.0\%$ | Servicio, Universidad | `PROPUESTA.descuentoAplicadoPct` | `vw_kpi_leads_descuento_promedio` |
| **KPI-2.6** | **Rendimiento por Universidad** | Identificar casas de estudio con mayor volumen y tasa de cierre comercial. | $\left(\frac{\text{Convertidos a Pago por Univ.}}{\text{Total Negociaciones por Univ.}}\right) \times 100$ | Mensual | Seguimiento Dimensional | Universidad | `UNIVERSIDAD`, `BUYER`, `FACT_NEGOCIACION` | `vw_kpi_leads_por_universidad`<br>Dimensión: `DIM_UNIVERSIDAD` |

> **Nota metodológica del Data Mart `dm_leads`:**
> 1. **Temporalidad del Cierre:** El ciclo de venta de tesis es un proceso consultivo multisesión por WhatsApp; por ello, la métrica se evalúa en **horas** (meta de 72 h o 3 días naturales), no en minutos, reflejando el tiempo real de deliberación del tesista.
> 2. **Precios y Descuentos Reales:** Solo se calculan descuentos y precios para negociaciones que cuenten con una cotización formal en `PROPUESTA`; no se imputan precios base arbitrarios.

---

## 4. FASE 3 — PAYERS: COBRANZA Y ACTIVACIÓN DEL SERVICIO

### 4.1. Objetivo de la Fase
PAYERS es la etapa en la que el lead que ya aceptó una propuesta y superó sus objeciones debe convertirse efectivamente en un cliente que paga, pudiendo ser un universitario en su último año (9.º o 10.º ciclo) o un egresado/bachiller en busca de su título profesional. El objetivo de la etapa es hacer transicionar de manera natural desde la aceptación de la propuesta hacia el pago, ofreciendo canales de pago inmediatos, y activar alertas automáticas de emplazamiento que impulsen la cobranza cuando el compromiso de pago no se concreta dentro del plazo esperado. La gestión recae en el Agente Negociador en coordinación con el módulo de pagos, cerrando con la transferencia del caso al servicio de atención (Fase CUSTOMERS).

### 4.2. Canales de Pago e Interfaz de Cobro
El diseño prioriza que el lead pueda pasar de "aceptar la propuesta" a "pagar", brindando un enlace directo a la pasarela de pago. Ambos canales se resuelven dentro del mismo Checkout integrado de Culqi, por lo que el sistema no contempla carga de comprobantes ni validación manual:

| Canal | Descripción | Acreditación | Cuándo se recomienda |
|---|---|---|---|
| **Yape (Culqi Checkout)** | Botón de pago Yape integrado nativamente en el Checkout de Culqi; el cliente ingresa su número de celular y aprueba el pago desde la app Yape con código de aprobación. | **Automática:** Culqi notifica el pago al sistema por webhook (`charge.succeeded`) en cuanto se aprueba, sin que el cliente suba captura, boleta ni número de orden. | Canal por defecto para cuotas o montos menores; el más ágil para el estudiante. |
| **Tarjeta de crédito/débito (Culqi Checkout)** | Checkout seguro con tarjeta (Visa, Mastercard, Amex, Diners), en la misma pantalla interactiva que Yape. | **Automática:** Igual que Yape, vía webhook instantáneo de Culqi. | Pago completo o modalidades financiadas en 2 o 3 cuotas; clientes que prefieren no compartir su número de celular. |

### 4.3. Alertas de Emplazamiento para Impulsar la Cobranza
Estas alertas son las que ejecuta el servicio `EmplazamientoAlertsService` y corresponden a la actividad "Emitir alertas de emplazamiento", originando el KPI de tasa de recuperación por alertas:

| Disparador (Trigger) | Tiempo de Espera | Acción del Agente IA | Ejemplo de Mensaje Enviado |
|---|---|---|---|
| Propuesta aceptada, pago no iniciado. | 4 horas | Reenvía el link de pago directo y consulta dudas. | *"Aquí tienes el link para completar tu pago 👉 [link]. ¿Alguna duda antes de continuar?"* |
| Checkout abierto, pago no completado. | 12 horas | Envía recordatorio y ofrece fraccionar el monto en cuotas. | *"Vimos que empezaste el pago, ¿tuviste algún inconveniente? Recuerda que puedes pagarlo también en 2 o 3 cuotas."* |
| Dos recordatorios enviados sin respuesta. | 24 horas adicionales | Escala el caso a un asesor humano, con el historial de chat completo. | *(Mensaje interno de escalamiento en CRM; no se envía al cliente).* |
| Pago confirmado por el sistema (webhook Culqi). | Inmediato | Envía bienvenida formal y cronograma de trabajo inicial. | *"¡Pago confirmado! 🎉 En breve tu asesor asignado se pondrá en contacto contigo. Aquí tienes tu cronograma inicial."* |

### 4.4. Matriz de Actividades Clave de la Fase PAYERS

| Actividades Clave | Canales de Pago | Indicadores (KPI) | Actividades del Agente IA | Alertas de Emplazamiento |
|---|---|---|---|---|
| **Presentar los canales de pago** inmediatamente después de que el lead acepta la propuesta. | Yape y Tarjeta (Culqi Checkout automático) | — *(Sin KPI propio; el sistema no registra eventos de clic previo a Culqi, sino el resultado final de la transacción)* | Comparte el link directo del Checkout de Culqi (Yape + Tarjeta) por WhatsApp. | — *(Aún no aplica; la propuesta recién fue aceptada).* |
| **Generar dinámicamente la orden y pantalla de cobro** con monto y concepto exactos. | Checkout Culqi para Yape / Tarjeta | — *(Actividad de soporte transaccional, sin KPI propio)* | Configura la orden con el monto acordado, concepto de tesis y número de cuotas pactadas. | — |
| **Monitorear y confirmar el estado del pago.** | Yape / Tarjeta: confirmación automática por webhook de Culqi | **Tiempo promedio de confirmación de pago (Culqi).**<br>$\frac{\sum (\text{Fecha Confirmación} - \text{Fecha Creación Pago})}{\text{N.° Pagos con Confirmación Registrada}}$<br>🟢 $\le 10\text{ min}$ · 🟡 $10–30\text{ min}$ · 🔴 $> 30\text{ min}$ | Recibe el webhook de Culqi y actualiza el estado de `PENDIENTE` a `CONFIRMADO` sin intervención manual. | — |
| **Emitir alertas de emplazamiento** cuando el lead no completa el pago dentro del plazo. | Aplica a ambos canales; el recordatorio reitera el link del Checkout. | **Tasa de recuperación por alerta de cobranza.**<br>$\left(\frac{\text{N.° Pagos Confirmados precedidos de Alerta}}{\text{N.° Total Pagos Confirmados}}\right) \times 100$<br>🟢 $\ge 30\%$ · 🟡 $15–29.9\%$ · 🔴 $< 15\%$ | Detecta el tiempo transcurrido sin pago y envía mensaje persuasivo reiterando el beneficio o financiamiento. | 4 h sin pago: reenvía el link.<br>12 h: ofrece cuotas.<br>+24 h sin respuesta: escala a asesor humano. |
| **Registrar confirmación de pago y transferir el caso al servicio (Fase CUSTOMERS).** | — | **Tasa de conversión Propuesta ➔ Pago.**<br>$\left(\frac{\text{N.° Estudiantes con Pago Confirmado}}{\text{N.° Estudiantes con Propuesta Aceptada}}\right) \times 100$<br>🟢 $\ge 60\%$ · 🟡 $40–59.9\%$ · 🔴 $< 40\%$ | Al confirmar el pago, crea el registro en `PAYER`, actualiza `estadoFunnel` a `PAYER` y deriva al módulo postventa. | — |
| **Enviar bienvenida y activación inmediata** con el cronograma preliminar. | — | **Recaudación total por método y modalidad.**<br>$\sum \text{Monto Pagado}$ agrupado por método (Yape/Tarjeta), pasarela y cuotas.<br>*(Indicador de seguimiento financiero, sin semáforo).* | Envía automáticamente mensaje de bienvenida con cronograma y credenciales de acceso. | Pago confirmado ➔ envío inmediato de bienvenida y cronograma. |

### 4.5. Indicadores (KPI) Consolidados del Data Mart `inbestiga_dm_payers`

| N.° KPI | Nombre del Indicador | Fórmula Matemática | Frecuencia | Metas / Semáforo | Vista Analítica en `inbestiga_dm_payers` |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **KPI-3.1** | **Tiempo promedio de confirmación de pago (Culqi: Yape y tarjeta)** | $\frac{\sum (\text{fechaConfirmacion} - \text{fechaCreacion})}{\text{N.° pagos con confirmación registrada}}$ | Diaria / Continua | 🟢 $\le 10\text{ min}$<br>🟡 $10–30\text{ min}$<br>🔴 $> 30\text{ min}$ | `vw_kpi_payers_tiempo_confirmacion` |
| **KPI-3.2** | **Tasa de recuperación por alerta de cobranza** | $\left(\frac{\text{N.° pagos confirmados precedidos de alerta al mismo lead}}{\text{N.° pagos confirmados}}\right) \times 100$ | Semanal | 🟢 $\ge 30\%$<br>🟡 $15–29.9\%$<br>🔴 $< 15\%$ | `vw_kpi_payers_recuperacion_alertas` |
| **KPI-3.3** | **Tasa de conversión Propuesta ➔ Pago** | $\left(\frac{\text{N.° estudiantes con pago confirmado}}{\text{N.° estudiantes con propuesta aceptada}}\right) \times 100$ | Diaria | 🟢 $\ge 60\%$<br>🟡 $40–59.9\%$<br>🔴 $< 40\%$ | `vw_kpi_payers_conversion` |
| **KPI-3.4** | **Recaudación total por método y modalidad** | $\sum \text{monto\_pagado}$ agrupado por método (Yape/Tarjeta), gateway y cuotas | Mensual | Seguimiento Financiero | `vw_kpi_payers_recaudacion_total` |

> **Nota metodológica del diseño dimensional:**
> 1. **Ausencia de "Tasa de Clics en Link":** El sistema transaccional no registra un evento intermedio de apertura de enlace previo a la pasarela externa de Culqi; el hecho atómico persistido es la creación de la orden (`fechaCreacion`) y la resolución del webhook (`fechaConfirmacion`).
> 2. **Base de Medición del Tiempo:** El tiempo de confirmación se computa entre `fechaCreacion` y `fechaConfirmacion` de la transacción real; los registros pendientes no confirmados permanecen con valor `NULL` y no se les imputan fallbacks arbitrarios.
> 3. **Denominador de Conversión:** El cálculo se realiza estrictamente sobre aquellos estudiantes cuya propuesta comercial fue formalmente `ACEPTADA` (`fn.propuesta_aceptada = 1`), excluyendo cotizaciones descartadas o en evaluación preliminar.

---

## 5. FASE 4 — CUSTOMERS: ATENCIÓN, BITÁCORA Y CUMPLIMIENTO

### 5.1. Objetivo de la Fase
Garantizar la ejecución oportuna y de alta calidad del servicio académico contratado. Incluye la asignación del asesor metodológico especializado en menos de 24 horas, la programación de la primera sesión de inducción en menos de 48 horas vía Google Meet, el registro riguroso de la bitácora de avances por capítulo de tesis, la detección proactiva de señales de riesgo de abandono y la medición de la satisfacción mediante encuestas oficiales (1 a 5 estrellas).

### 5.2. Actividades del Proceso de Negocio (Matriz de Actividades)

| N.° Actividad | Nombre de la Actividad | Descripción Operacional | Cliente / Usuario Objetivo | Actividad del Agente IA (Atención / Postventa) | Entradas del Proceso | Salidas del Proceso |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-4.1** | **Bienvenida y Ficha del Cliente** | Apertura del expediente del tesista, registro de metas y creación del proyecto en plataforma. | Payer con pago confirmado. | Envía mensaje de bienvenida personalizado por WhatsApp con credenciales y guía inicial. | Pago confirmado y datos del estudiante. | Ficha de cliente activa (`CUSTOMER`, `PROYECTO_TESIS`). |
| **ACT-4.2** | **Designación de Asesor Metodológico** | Asignación de un especialista según carrera, línea de investigación y carga de trabajo actual. | Customer listo para iniciar asesoría. | Sugiere y reserva al asesor idóneo respetando el límite de 10 tesistas por asesor. | Línea de tesis y disponibilidad del asesor. | Acta de designación (`ASIGNACION_ASESOR`). |
| **ACT-4.3** | **Agendamiento de la 1.ª Sesión (48h)** | Coordinación de fecha, hora y generación automática de la sala de Google Meet. | Customer y Asesor asignado. | Envía recordatorio por WhatsApp y sincroniza el enlace de Meet con Google Calendar. | Disponibilidad horaria del estudiante. | Sesión agendada (`SESION_ASESORIA`). |
| **ACT-4.4** | **Control de Bitácora y Entregables** | Registro del acta de sesión: acuerdos, porcentaje de avance de la tesis y observaciones docentes. | Tesista en proceso de desarrollo. | Registra la bitácora tras la sesión y actualiza la barra de progreso de la tesis en tiempo real. | Acta de reunión y entregable del capítulo. | Entrada en bitácora (`BITACORA_AVANCE`). |
| **ACT-4.5** | **Monitoreo y Detección de Riesgo** | Detección automática de abandono si el alumno cancela 2 sesiones seguidas o su avance se estanca $> 14$ días. | Tesista en estado vulnerable. | Dispara alerta de riesgo a coordinación y agenda sesión de contingencia por WhatsApp. | Registro de inactividad o sesiones canceladas. | Alerta de riesgo (`ALERTA_POSTVENTA`). |
| **ACT-4.6** | **Encuesta de Satisfacción** | Envío de cuestionario al culminar capítulos clave o la sustentación final (escala 1 a 5 estrellas). | Customer al finalizar el servicio. | Envía formulario por WhatsApp, recolecta la valoración y calcula el CSAT académico. | Conclusión de sesión o servicio. | Encuesta guardada (`ENCUESTA_SATISFACCION`). |

### 5.3. Preguntas de Negocio del Data Mart `dm_customers`
1. ¿Cuánto tiempo transcurre entre la confirmación del pago y la asignación formal del asesor metodológico?
2. ¿Qué porcentaje de tesistas tienen su primera sesión de asesoría programada y ejecutada dentro de las primeras 48 horas?
3. ¿Cuál es el porcentaje de cumplimiento de las fechas del cronograma de entregas y el avance medio de la tesis?
4. ¿Cuántos casos con riesgo de abandono fueron detectados oportunamente para evitar la pérdida del alumno?
5. ¿Cuál es la calificación promedio de satisfacción del estudiante respecto a la calidad del asesor y el servicio?

### 5.4. Matriz Consolidada de Indicadores (KPIs) — Data Mart `inbestiga_dm_customers`

| N.° KPI | Nombre del KPI | Objetivo de Negocio | Fórmula Matemática | Frecuencia | Metas / Semáforo | Dimensiones | Origen OLTP (`inbestiga_db`) | Vista Analítica en Data Mart |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **KPI-4.1** | **Tiempo de Asignación de Asesor Metodológico** | Evitar retrasos entre la confirmación del pago y la asignación del docente especialista. | $\frac{\sum (\text{Fecha Asignación} - \text{Fecha Pago})}{\text{N.° Asignaciones Registradas}}$ | Diaria | 🟢 $\le 24\text{ horas}$<br>🟡 $24.1 - 48\text{ horas}$<br>🔴 $> 48\text{ horas}$ | Asesor, Carrera, Tiempo | `ASIGNACION_ASESOR.fechaAsignacion`, `PAGO` | `vw_kpi_customers_tiempo_asignacion`<br>Hecho: `FACT_ATENCION` |
| **KPI-4.2** | **1.ª Sesión Agendada dentro de 48h** | Garantizar un arranque inmediato que brinde seguridad metodológica al tesista. | $\left(\frac{\text{Sesiones Agendadas en } \le 48\text{h}}{\text{Total Customers Atendidos}}\right) \times 100$ | Semanal | 🟢 $\ge 85\%$<br>🟡 $65\% - 84.9\%$<br>🔴 $< 65\%$ | Asesor, Universidad, Tiempo | `SESION.fechaHoraProgramada`, `CUSTOMER` | `vw_kpi_customers_primera_sesion_48h` |
| **KPI-4.3** | **Tasa de Cumplimiento del Cronograma y Avance** | Controlar la puntualidad de las sesiones de revisión y el progreso porcentual de la tesis. | $\left(\frac{\text{Sesiones Realizadas}}{\text{Total Sesiones Programadas}}\right) \times 100$ | Mensual | 🟢 $\ge 75\%$<br>🟡 $55\% - 74.9\%$<br>🔴 $< 55\%$ | Asesor, Carrera, Servicio | `SESION.estado`, `BITACORA_TESIS.porcentajeAvance` | `vw_kpi_customers_cumplimiento_cronograma` |
| **KPI-4.4** | **Tasa de Detección Temprana de Riesgo de Abandono** | Monitorear proactivamente casos con señales de estancamiento o pausas prolongadas. | $\left(\frac{\text{Casos con Alerta de Riesgo}}{\text{Total Tesistas Monitoreados}}\right) \times 100$ | Semanal | 🟢 $\le 20\%$<br>🟡 $20.1\% - 35\%$<br>🔴 $> 35\%$ | Asesor, Universidad, Estado | `CUSTOMER.estadoServicio` (`PAUSADO` / alertas) | `vw_kpi_customers_deteccion_riesgo`<br>Dimensión: `DIM_ESTADO_SERVICIO` |
| **KPI-4.5** | **Satisfacción Promedio del Tesista (CSAT)** | Medir la percepción cualitativa del estudiante respecto a la solvencia y trato del asesor (1 a 5 estrellas). | $\frac{\sum \text{Calificación de Encuesta}}{\text{Total Encuestas Respondidas}}$ | Mensual | 🟢 $\ge 4.20 \star$<br>🟡 $3.50 - 4.19 \star$<br>🔴 $< 3.50 \star$ | Asesor, Servicio, Carrera | `ENCUESTA_SATISFACCION.calificacionGeneral` | `vw_kpi_customers_satisfaccion`<br>Dimensión: `DIM_ASESOR` |

> **Nota metodológica del Data Mart `dm_customers`:**
> 1. **Medición Real de Asignaciones:** Los tiempos de asignación y primera sesión se evalúan únicamente cuando los eventos han ocurrido (`IS NOT NULL`); no se imputan valores ficticios (p. ej. 12 h o 36 h) para disimular clientes pendientes.
> 2. **Puntaje de Satisfacción Auténtico:** El indicador de satisfacción se extrae de la tabla transaccional `ENCUESTA_SATISFACCION` registrada tras las sesiones o entregas de capítulos, evitando notas promedio fijas o hardcodeadas.

---

## 6. TRAZABILIDAD INTEGRAL: OLTP ➔ ETL ➔ DATA MARTS ➔ BACKEND ➔ FRONTEND

El sistema garantiza una concordancia de 100% en todas sus capas, permitiendo auditar cada métrica desde el formulario de registro del estudiante hasta el pixel en la pantalla del panel de control:

```mermaid
graph TD
    subgraph OLTP [1. BASE TRANSACCIONAL: inbestiga_db]
        T1["BUYER / CANAL / CAMPAÑA / INTERACCION"]
        T2["LEAD / PROPUESTA / OBJECION / CONVERSACION"]
        T3["PAGO / PAYER / NOTIFICACION / CULQI"]
        T4["CUSTOMER / ASESOR / SESION / ENCUESTA_SATISFACCION"]
    end

    subgraph ETL [2. PROCEDIMIENTOS ETL INDEPENDIENTES (sp_etl_populate_datamarts)]
        E1["inbestiga_dm_buyers.dbo.sp_etl_dm_buyers"]
        E2["inbestiga_dm_leads.dbo.sp_etl_dm_leads"]
        E3["inbestiga_dm_payers.dbo.sp_etl_dm_payers"]
        E4["inbestiga_dm_customers.dbo.sp_etl_dm_customers"]
    end

    subgraph MARTS [3. 4 BASES DE DATOS FÍSICAS DE DATA MARTS]
        M1["inbestiga_dm_buyers.dbo.FACT_CAPTACION + Vistas KPI"]
        M2["inbestiga_dm_leads.dbo.FACT_NEGOCIACION + Vistas KPI"]
        M3["inbestiga_dm_payers.dbo.FACT_COBRANZA + Vistas KPI"]
        M4["inbestiga_dm_customers.dbo.FACT_ATENCION + Vistas KPI"]
    end

    subgraph BACKEND [4. BACKEND API: apps/api NestJS]
        B1["DwService: Consultas Tipadas a Vistas DW"]
        B2["DashboardService: Agregación de Data Marts"]
        B3["GET /api/v1/dashboard/overview"]
    end

    subgraph FRONTEND [5. DASHBOARD UI: apps/web Next.js]
        F1["Pestaña 1: dm_buyers con Semáforos y CPL"]
        F2["Pestaña 2: dm_leads con Descuentos y Objeciones"]
        F3["Pestaña 3: dm_payers con Culqi y Alertas"]
        F4["Pestaña 4: dm_customers con 48h y Satisfacción"]
    end

    T1 --> E1 --> M1
    T2 --> E2 --> M2
    T3 --> E3 --> M3
    T4 --> E4 --> M4
    MS -.-> M1
    MS -.-> M2
    MS -.-> M3
    MS -.-> M4

    M1 --> B1
    M2 --> B1
    M3 --> B1
    M4 --> B1
    B1 --> B2 --> B3
    B3 --> F1
    B3 --> F2
    B3 --> F3
    B3 --> F4
```

---

## 7. GUÍA DE SUSTENTACIÓN ACADÉMICA ANTE EL DR. MENDOZA RIVERA

Cuando el docente evalúe el informe y el sistema en vivo, formule las siguientes respuestas técnicas y metodológicas:

### P1: "¿Por qué dividieron el sistema en Data Marts en lugar de un solo Data Warehouse?"
> **Respuesta:** "Siguiendo la metodología de Ciclo de Vida Dimensional de Ralph Kimball, la empresa de asesoría de tesis tiene **procesos de negocio claramente diferenciados con distintos usuarios y niveles de latencia**:
> - Marketing necesita analizar campañas y CPL (`dm_buyers`).
> - Ventas y el bot de IA analizan objeciones y descuentos (`dm_leads`).
> - Finanzas y pasarelas analizan conciliación Culqi y cuotas (`dm_payers`).
> - Coordinación académica analiza avance de tesis y riesgo de deserción (`dm_customers`).
> 
> Cada Data Mart modela un proceso con su tabla de hechos central, y todos se integran coherentemente sin redundancias mediante **Dimensiones Conformadas** (`dm_shared.DIM_TIEMPO`, `DIM_UNIVERSIDAD`, `DIM_CARRERA`, `DIM_SERVICIO`, `DIM_ESTUDIANTE`), lo que permite realizar consultas Drill-Across entre fases."

### P2: "¿Cómo garantizan que los KPIs no salgan de la nada ni estén inventados?"
> **Respuesta:** "Todos los KPIs se calculan mediante consultas agregadas `COUNT`, `SUM`, `AVG` y `DATEDIFF` sobre las tablas de hechos atómicas y las dimensiones del Data Mart. Hemos eliminado cualquier constante o fallback hardcodeado:
> - El CPL divide el presupuesto real entre leads generados.
> - La detección de riesgo evalúa el estado real (`PAUSADO` o en riesgo) entre los clientes activos.
> - La tasa de 48h compara estrictamente la diferencia en horas entre el pago y la primera sesión.
> - La satisfacción proviene del promedio directo de las encuestas registradas en la base de datos."

### P3: "¿Por qué agregaron DIM_UNIVERSIDAD y DIM_CARRERA a los Data Marts si en algunos gráficos iniciales no estaban?"
> **Respuesta:** "Porque en el análisis dimensional de Kimball, la universidad y la carrera son **dimensiones conformadas de primer nivel**. Permitir que tanto `dm_buyers`, `dm_leads`, `dm_payers` y `dm_customers` compartan la misma clave de universidad (`universidad_key`) hace posible responder preguntas gerenciales cruzadas como: *'¿Qué universidad tiene el mayor costo por lead, cuántas de sus propuestas aprueban y cuál es su tasa de graduación efectiva?'*."

# Guía de Demostración para Evaluación Docente: INBESTIGA.TESIS

Esta guía describe el paso a paso exacto para realizar la demostración académica ante el docente evaluador sin manipular manualmente la base de datos.

---

## Flujo Completo de Demostración (End-to-End)

```
ANUNCIO/LANDING ──> FORMULARIO ──> BUYER ──> LEAD SCORE ──> LEAD ──> [INICIAR NEGOCIACIÓN]
      ──> AGENTE IA ──> WHATSAPP (OpenWA) ──> DIAGNÓSTICO ──> PROPUESTA ──> OBJECIÓN
      ──> REGLAS COMERCIALES ──> COTIZACIÓN ──> PASARELA DE PAGO ──> WEBHOOK
      ──> PAYER ──> ASIGNACIÓN ASESOR ──> PRIMERA SESIÓN ──> CUSTOMER ──> DATA WAREHOUSE (ETL)
```

---

### PASO 1: Presentación de la Plataforma y Funnel IMPULSE
1. Abrir el navegador en `http://localhost:3000`.
2. Explicar al docente la propuesta de valor académica y la visualización del Funnel **IMPULSE**:
   - `UNIVERSO`: Masa total de estudiantes alcanzados.
   - `BUYER`: Prospectos que han completado el formulario de captación.
   - `LEAD`: Prospectos calificados con Lead Score >= 70 o interacciones activas.
   - `PAYER`: Clientes con primer pago confirmado por pasarela real.
   - `CUSTOMER`: Tesistas activos con asesor asignado y sesiones programadas.

---

### PASO 2: Captación y Lead Scoring Automático
1. Hacer clic en **[Postular Tesis]** o entrar a `http://localhost:3000/formulario`.
2. Registrar un estudiante (o usar los valores predeterminados):
   - **Nombres**: Ana Lucía
   - **Apellidos**: Pérez Mendoza
   - **WhatsApp**: 51949123456
   - **Universidad**: Universidad Nacional de Trujillo (UNT)
   - **Carrera**: Ingeniería de Sistemas
   - **Ciclo**: 10mo ciclo
   - **Dolor**: Falta de tiempo y asesor no brinda feedback oportuno
   - **Consentimiento WhatsApp**: Marcado
3. Pulsar **[Enviar Formulario y Calcular Lead Score]**.
4. Mostrar al docente la tarjeta de resultados:
   - **Score**: `92 / 100`
   - **Estado Funnel**: `LEAD`
   - **Desglose de Puntos**: +20 perfil completo, +15 tipo de investigación, +15 plazo definido, +10 situación laboral, +10 dolor identificado, +15 consentimiento WhatsApp, +15 descarga lead magnet.

---

### PASO 3: Panel Administrativo de BUYERS y Acción Central
1. Entrar a `http://localhost:3000/admin/buyers`.
2. Resaltar al docente que los prospectos aparecen **ordenados por Lead Score DESCendente**.
3. Localizar a **Ana Lucía Pérez Mendoza** (Score: 92, Estado: LEAD).
4. Pulsar el botón prominente:
   ```
   [ INICIAR NEGOCIACIÓN ]
   ```
5. **Observar la respuesta instantánea**:
   - El backend invoca al Agente IA.
   - El Agente IA analiza el formulario y redacta el primer mensaje hiperpersonalizado:
     > *"Hola Ana Lucía, te saluda el equipo especialista de INBESTIGA.TESIS. Estuvimos revisando la información que nos dejaste sobre tu TESIS en Ingeniería de Sistemas de la UNT. Comprendemos lo desafiante que es cuando surge: 'Falta de tiempo y asesor de tesis no brinda feedback oportuno'..."*
   - El mensaje se despacha vía **OpenWA** al WhatsApp del estudiante.
   - La conversación avanza a etapa `DIAGNOSTIC`.

---

### PASO 4: Monitoreo en Vivo (Live Chat) y Negociación Inteligente
1. Pulsar **[Ver en Live Chat]** o navegar a `http://localhost:3000/admin/live-chat`.
2. Observar el historial de chat con las burbujas del estudiante y del Agente IA.
3. Para demostrar la interactividad en vivo, en la barra inferior pulsar el botón rápido de plantilla:
   - `2. Objeción Precio`: *"Me parece un poco alto el precio para mi presupuesto de estudiante. ¿Tienen facilidades de pago o cuotas?"*
   - Pulsar **[Enviar]**.
4. **Respuesta del Agente IA**:
   - La IA invoca la herramienta backend `calculate_offer`.
   - El Motor de Reglas Comerciales valida el descuento (máximo 15%) y las cuotas permitidas.
   - La IA responde con la contraoferta validada y facilidades de pago en cuotas.
5. Simular la aceptación del estudiante con la plantilla:
   - `3. Aceptación y Pago`: *"Perfecto, acepto la propuesta de 2 cuotas. Por favor envíame el enlace para realizar el pago ahora mismo."*
   - Pulsar **[Enviar]**.
6. El Agente IA invoca `create_payment_request`, genera la orden y muestra el enlace seguro de pasarela: `http://localhost:3000/checkout/[cotizacionId]`.

---

### PASO 5: Pasarela de Pago Real y Confirmación por Webhook
1. Hacer clic en la tarjeta de orden de pago generada o abrir el enlace de checkout.
2. Mostrar la pantalla de **Checkout Seguro**:
   - Cotización oficial `COT-2026-XXXX`.
   - Selector de método de pago: **Tarjeta (Stripe)** o **Yape / Plin (QR)**.
3. Seleccionar **Yape / Plin** y pulsar **[Confirmar y Pagar]**.
4. **Transición Inmediata y Verificada**:
   - La pasarela valida el pago mediante Webhook.
   - El estado transiciona de **LEAD ──> PAYER**.
   - El backend crea automáticamente el registro de **CUSTOMER**.
   - Se asigna un Asesor Académico de la especialidad (Dr. Juan Carlos Alva o Mg. Carmen Rodríguez).
   - Se agenda la primera sesión formativa con enlace de Google Meet.
   - El estado avanza a **CUSTOMER**.

---

### PASO 6: Verificación en Gestión de CUSTOMERS
1. Entrar a `http://localhost:3000/admin/customers`.
2. Observar al nuevo estudiante registrado como **CUSTOMER Activo**.
3. Verificar el asesor asignado, la fecha de la primera sesión y el enlace de videoconferencia.

---

### PASO 7: Dashboard Ejecutivo y Sincronización del Data Warehouse (ETL)
1. Entrar a `http://localhost:3000/admin/dashboard`.
2. Mostrar al docente:
   - Embudo IMPULSE actualizado con contadores y tasas de conversión en tiempo real.
   - Monto total recaudado en Soles (S/).
   - Segmentaciones analíticas por Universidad y Carrera.
3. Pulsar el botón:
   ```
   [ EJECUTAR ETL (inbestiga_dw) ]
   ```
4. El backend ejecuta el procedimiento almacenado `sp_etl_populate_dw` en Microsoft SQL Server, sincronizando las tablas de dimensiones y hechos en menos de 50 ms con badge de confirmación.

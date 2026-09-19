# Arquitectura Integral: INBESTIGA.TESIS

## 1. Visión General
**INBESTIGA.TESIS** es una plataforma tecnológica orientada al sector educativo superior para la aceleración y gestión integral de tesis y proyectos de investigación. Implementa el funnel metodológico **IMPULSE**:
```
UNIVERSO ──> BUYER ──> LEAD ──> PAYER ──> CUSTOMER
```

## 2. Diagrama de Arquitectura de Extremo a Extremo

```mermaid
graph TD
    subgraph Capa_Cliente [Capa de Presentación Web]
        Web[Next.js 14 App Router :3000]
        Landing[Landing de Captación]
        Form[Formulario Responsive]
        AdminPanel[Panel Administrativo]
        LiveChat[Monitor Live Chat IA]
        DashboardView[Dashboard Analítico]
        Checkout[Pasarela Checkout]
    end

    subgraph Capa_Backend [Backend NestJS 10 :4000]
        API[API REST Global /api/v1]
        AuthMod[Auth & JWT Guard]
        BuyersMod[Buyers & Lead Scoring Engine]
        RulesEngine[Motor de Reglas Comerciales]
        AIAgentMod[Orquestador Agente IA]
        WhatsAppMod[Servicio WhatsApp]
        PaymentMod[Servicio Pasarela de Pagos]
        CustomerMod[Customer & Asesor Service]
        ETLMod[Orquestador ETL]
    end

    subgraph Capa_Integraciones [Servicios Externos y Contenedores]
        OpenWA[OpenWA Container :2785]
        Stripe[Stripe / MercadoPago Gateway]
        LLM[AI Provider: Gemini / Grok]
    end

    subgraph Capa_Datos [Microsoft SQL Server 2022 :1433]
        PrismaORM[Prisma Client ORM]
        OLTP[(inbestiga_db: Base Transaccional 26 Tablas)]
        ETLProc[sp_etl_populate_dw Stored Procedure]
        DW[(inbestiga_dw: Data Warehouse Dimensional Kimball)]
    end

    Web -->|HTTP / JSON| API
    API --> BuyersMod
    API --> AIAgentMod
    API --> WhatsAppMod
    API --> PaymentMod
    API --> CustomerMod
    API --> DashboardView

    AIAgentMod -->|Function Calling| RulesEngine
    AIAgentMod <-->|Generación Prompts| LLM
    WhatsAppMod <-->|REST API & Webhooks| OpenWA
    PaymentMod <-->|Checkout & Webhooks| Stripe

    BuyersMod --> PrismaORM
    RulesEngine --> PrismaORM
    CustomerMod --> PrismaORM
    PrismaORM <--> OLTP

    ETLMod -->|EXEC sp_etl_populate_dw| ETLProc
    OLTP -.->|Extracción y Transformación| ETLProc
    ETLProc -.->|Carga en Dimensiones y Hechos| DW
    DW -.->|Consultas de BI y KPIs| DashboardView
```

## 3. Principio de Aislamiento de la Inteligencia Artificial
La IA (Gemini / Grok) **NUNCA** interactúa de forma directa o arbitraria con SQL Server. Su interacción está estrictamente acotada a herramientas backend (*Tool / Function Calling*):
1. `get_buyer_profile`: Obtiene únicamente los datos académicos del estudiante.
2. `get_available_services`: Consulta el catálogo oficial de servicios.
3. `calculate_offer`: Valida descuentos ante el Motor de Reglas Comerciales.
4. `record_objection`: Registra objeciones y devuelve guías de manejo.
5. `create_payment_request`: Genera órdenes oficiales y enlaces criptográficos de pago.
6. `escalate_to_human`: Deriva la atención a supervisión humana.

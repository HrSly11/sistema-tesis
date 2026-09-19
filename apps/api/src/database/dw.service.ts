import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DwService {
  private readonly logger = new Logger(DwService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta el orquestador maestro ETL para poblar secuencialmente los 4 Data Marts independientes
   * (inbestiga_dm_buyers, inbestiga_dm_leads, inbestiga_dm_payers, inbestiga_dm_customers) desde inbestiga_db.
   */
  async runEtl(): Promise<{ exito: boolean; mensaje: string; duracionMs: number; timestamp: string }> {
    const inicio = Date.now();
    try {
      this.logger.log('Iniciando ejecución de orquestador ETL hacia los 4 Data Marts independientes...');
      await this.prisma.$executeRawUnsafe(`EXEC inbestiga_db.dbo.sp_etl_populate_datamarts;`);
      const duracionMs = Date.now() - inicio;
      this.logger.log(`ETL completado exitosamente en ${duracionMs} ms.`);
      return {
        exito: true,
        mensaje: 'Proceso ETL completado con éxito. Los 4 Data Marts independientes han sido sincronizados desde inbestiga_db.',
        duracionMs,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Error durante la ejecución del procedimiento ETL:', error);
      return {
        exito: false,
        mensaje: `Error ejecutando ETL: ${error.message}`,
        duracionMs: Date.now() - inicio,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * DATA MART 1: BUYERS (Captación y Marketing - inbestiga_dm_buyers)
   */
  async getDataMartBuyers(): Promise<any> {
    try {
      const conversion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_buyers.dbo.vw_kpi_buyers_conversion;`);
      const cpl: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_buyers.dbo.vw_kpi_buyers_cpl;`);
      const interacciones: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_buyers.dbo.vw_kpi_buyers_interacciones;`);
      const tiempoRespuesta: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_buyers.dbo.vw_kpi_buyers_tiempo_primera_respuesta;`);
      const porCanal: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_buyers.dbo.vw_kpi_buyers_por_canal;`);

      return {
        nombre: 'Data Mart: Captación y Marketing (BUYERS)',
        fase: 'FASE_1',
        kpis: {
          conversion: conversion[0] || {},
          cplPorCampana: cpl,
          promedioInteracciones: interacciones[0] || {},
          tiempoPrimeraRespuestaIA: tiempoRespuesta[0] || {},
          rendimientoCanales: porCanal,
        },
      };
    } catch (error: any) {
      this.logger.warn(`Error al consultar inbestiga_dm_buyers: ${error.message}`);
      return null;
    }
  }

  /**
   * DATA MART 2: LEADS (Conversión y Negociación con IA - inbestiga_dm_leads)
   */
  async getDataMartLeads(): Promise<any> {
    try {
      const conversion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_conversion;`);
      const recuperacion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_recuperacion_objeciones;`);
      const tiempoCierre: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_tiempo_negociacion;`);
      const escalamiento: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_escalamiento;`);
      const descuento: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_descuento_promedio;`);
      const porUniversidad: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_leads.dbo.vw_kpi_leads_por_universidad;`);

      return {
        nombre: 'Data Mart: Conversión y Negociación con IA (LEADS)',
        fase: 'FASE_2',
        kpis: {
          conversion: conversion[0] || {},
          recuperacionObjeciones: recuperacion[0] || {},
          tiempoCierre: tiempoCierre[0] || {},
          escalamientoHumano: escalamiento[0] || {},
          descuentoPromedio: descuento[0] || {},
          desglosePorUniversidad: porUniversidad,
        },
      };
    } catch (error: any) {
      this.logger.warn(`Error al consultar inbestiga_dm_leads: ${error.message}`);
      return null;
    }
  }

  /**
   * DATA MART 3: PAYERS (Cobranza y Pasarela Culqi - inbestiga_dm_payers)
   */
  async getDataMartPayers(): Promise<any> {
    try {
      const conversion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_payers.dbo.vw_kpi_payers_conversion;`);
      const confirmacion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_payers.dbo.vw_kpi_payers_tiempo_confirmacion;`);
      const alertas: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_payers.dbo.vw_kpi_payers_recuperacion_alertas;`);
      const recaudacion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_payers.dbo.vw_kpi_payers_recaudacion_total;`);

      return {
        nombre: 'Data Mart: Cobranza y Pasarela Culqi (PAYERS)',
        fase: 'FASE_3',
        kpis: {
          conversion: conversion[0] || {},
          tiempoConfirmacionCulqi: confirmacion[0] || {},
          recuperacionAlertasCobranza: alertas[0] || {},
          recaudacionPorMetodoYCuota: recaudacion,
        },
      };
    } catch (error: any) {
      this.logger.warn(`Error al consultar inbestiga_dm_payers: ${error.message}`);
      return null;
    }
  }

  /**
   * DATA MART 4: CUSTOMERS (Atención, Bitácora y Satisfacción - inbestiga_dm_customers)
   */
  async getDataMartCustomers(): Promise<any> {
    try {
      const asignacion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_customers.dbo.vw_kpi_customers_tiempo_asignacion;`);
      const primeraSesion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_customers.dbo.vw_kpi_customers_primera_sesion_48h;`);
      const cumplimiento: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_customers.dbo.vw_kpi_customers_cumplimiento_cronograma;`);
      const riesgo: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_customers.dbo.vw_kpi_customers_deteccion_riesgo;`);
      const satisfaccion: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM inbestiga_dm_customers.dbo.vw_kpi_customers_satisfaccion;`);

      return {
        nombre: 'Data Mart: Atención, Bitácora y Satisfacción (CUSTOMERS)',
        fase: 'FASE_4',
        kpis: {
          tiempoAsignacionAsesor: asignacion[0] || {},
          primeraSesion48h: primeraSesion[0] || {},
          cumplimientoCronograma: cumplimiento[0] || {},
          deteccionRiesgoAbandono: riesgo[0] || {},
          satisfaccionPromedio: satisfaccion[0] || {},
        },
      };
    } catch (error: any) {
      this.logger.warn(`Error al consultar inbestiga_dm_customers: ${error.message}`);
      return null;
    }
  }

  /**
   * Retorna los 4 Data Marts estructurados para el Dashboard Analítico
   */
  async getAllDataMarts(): Promise<{
    dm_buyers: any;
    dm_leads: any;
    dm_payers: any;
    dm_customers: any;
  }> {
    const [buyers, leads, payers, customers] = await Promise.all([
      this.getDataMartBuyers(),
      this.getDataMartLeads(),
      this.getDataMartPayers(),
      this.getDataMartCustomers(),
    ]);

    return {
      dm_buyers: buyers,
      dm_leads: leads,
      dm_payers: payers,
      dm_customers: customers,
    };
  }

  /**
   * Compatibilidad hacia atrás para endpoints previos
   */
  async getDwOverview(): Promise<any> {
    return this.getAllDataMarts();
  }
}

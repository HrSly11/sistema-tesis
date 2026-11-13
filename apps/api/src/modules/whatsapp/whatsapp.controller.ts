import { Controller, Post, Body, Get, Logger, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { EvolutionDbService } from './evolution-db.service';
import { NegotiationService } from '../negotiation/negotiation.service';
import { PayersService } from '../payers/payers.service';
import { OpenAiVoiceService } from '../voice/openai-voice.service';

@ApiTags('WhatsApp / Evolution API')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly evolutionDb: EvolutionDbService,
    @Inject(forwardRef(() => NegotiationService))
    private readonly negotiationService: NegotiationService,
    @Inject(forwardRef(() => PayersService))
    private readonly payersService: PayersService,
    private readonly voice: OpenAiVoiceService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de la sesión de WhatsApp en Evolution API y QR si aplica' })
  async getStatus() {
    return this.whatsappService.getStatus();
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Receptor de Webhooks entrantes de Evolution API (evento MESSAGES_UPSERT)' })
  async handleWebhook(@Body() payload: any) {
    this.logger.log(`Webhook entrante de Evolution: ${JSON.stringify(payload).substring(0, 150)}...`);

    // Evolution API v2 emite { event: 'messages.upsert' | 'MESSAGES_UPSERT', data: {...} }
    const evento = String(payload?.event || '').toLowerCase();
    if (evento && !evento.includes('messages.upsert')) {
      return { status: 'ignored', event: evento };
    }

    const data = payload?.data || payload;
    const key = data?.key || {};

    // Ignorar mensajes enviados por el propio bot
    if (key.fromMe === true || data.fromMe === true) {
      return { status: 'ignored', reason: 'fromMe' };
    }

    // remoteJid: "51949123456@s.whatsapp.net" | grupos "@g.us" | estados "status@broadcast"
    const remoteJid = String(key.remoteJid || data.from || '');
    if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid.includes('status@')) {
      return { status: 'ignored', reason: 'group_or_status' };
    }

    const esAudio = !!data.message?.audioMessage;
    let contenido: string | null = null;

    if (esAudio) {
      if (!this.voice.enabled) {
        return { status: 'ignored', reason: 'audio_sin_openai' };
      }
      try {
        contenido = await this.transcribirAudio(data, key);
      } catch (error: any) {
        this.logger.error(`Fallo al transcribir audio de WhatsApp: ${error.message}`);
        return { status: 'error', reason: 'stt_failed' };
      }
    } else {
      contenido = this.extraerTexto(data.message) || data.message?.conversation;
    }

    if (!contenido || !remoteJid) {
      return { status: 'ignored', reason: 'sin_texto' };
    }

    // WhatsApp usa direccionamiento por LID: los ENTRANTES llegan como "...@lid"
    // (un identificador opaco) en lugar del teléfono. Se traduce a teléfono real
    // para poder localizar la ORDEN_PAGO y responder con el Agente PAYERS.
    const telefono = await this.resolverTelefonoEntrante(remoteJid, key, data);
    this.logger.log(
      `Mensaje entrante de WhatsApp ${remoteJid} (teléfono: ${telefono || 'NO_RESUELTO'}): "${contenido}"`,
    );

    if (!telefono) {
      return { status: 'ignored', reason: 'lid_sin_telefono', remoteJid };
    }

    return this.enrutarEntrante(telefono, contenido, esAudio);
  }

  /**
   * Obtiene el número de teléfono real (PN) del remitente de un mensaje entrante.
   *  1. Si Evolution ya adjuntó el alterno del JID (`remoteJidAlt` / `senderPn`), se usa.
   *  2. Si el remitente es un LID (`...@lid`), se resuelve contra la BD de Evolution.
   *  3. Si es un JID normal (`...@s.whatsapp.net`), se extraen los dígitos.
   */
  private async resolverTelefonoEntrante(
    remoteJid: string,
    key: any,
    data: any,
  ): Promise<string | null> {
    const alt = key?.remoteJidAlt || key?.participantAlt || data?.remoteJidAlt || data?.senderPn;
    if (alt && String(alt).includes('@s.whatsapp.net')) {
      return String(alt).split('@')[0].replace(/\D/g, '');
    }

    if (!remoteJid.endsWith('@lid')) {
      const digits = remoteJid.split('@')[0].replace(/\D/g, '');
      return digits || null;
    }

    return this.evolutionDb.resolverTelefonoDesdeLid(remoteJid);
  }

  /**
   * Enruta un mensaje entrante de WhatsApp:
   *   1. Si el número corresponde a una ORDEN_PAGO con contrato en INBESTIGA_TESIS → Agente PAYERS
   *      (el mismo que alimenta el Live Chat de cobranza) y se responde por WhatsApp.
   *   2. Si no coincide con ninguna orden → Agente de negociación (inbestiga_db / Prisma).
   */
  private async enrutarEntrante(cleanPhone: string, contenido: string, esAudio = false) {
    const orden = await this.payersService.buscarOrdenPorTelefono(cleanPhone);

    if (orden?.orden_pago_id) {
      const ordenPagoId = Number(orden.orden_pago_id);
      this.logger.log(
        `→ Enrutando a Agente PAYERS (Live Chat): ${orden.codigo_orden} · ${orden.nombres} ${orden.apellidos} (modo: ${esAudio ? 'voz' : 'texto'})`,
      );

      const resultado = await this.payersService.procesarChatAgente(ordenPagoId, contenido);

      let envio: any;
      if (esAudio && this.voice.enabled) {
        const audio = await this.voice.synthesize(resultado.respuesta);
        envio = await this.whatsappService.enviarNotaDeVoz(cleanPhone, audio.toString('base64'));
      } else {
        envio = await this.whatsappService.enviarTextoSimple(cleanPhone, resultado.respuesta);
      }

      return {
        status: 'processed',
        agente: 'PAYERS',
        orden: orden.codigo_orden,
        modo: esAudio ? 'voz' : 'texto',
        transcripcion: esAudio ? contenido : undefined,
        respuesta: resultado.respuesta,
        guardrailsActivados: resultado.guardrailsActivados,
        herramientasEjecutadas: resultado.herramientasEjecutadas,
        envio,
      };
    }

    if (this.voice.enabled) {
      return this.responderConOpenAi(cleanPhone, contenido, esAudio);
    }

    const resultado = await this.negotiationService.procesarMensajeEstudiante(cleanPhone, contenido);
    return { status: 'processed', agente: 'NEGOCIACION', resultado };
  }

  /**
   * Obtiene el .ogg del audio: primero desde el Base64 del webhook (si Evolution lo envía)
   * y, si no, vía POST /chat/getBase64FromMediaMessage/{instance}. Luego lo transcribe (STT).
   */
  private async transcribirAudio(data: any, key: any): Promise<string> {
    let b64: string | null = data?.message?.base64 || data?.base64 || null;
    if (!b64) {
      b64 = await this.whatsappService.getMediaBase64(key);
    }
    if (!b64) throw new Error('no se pudo obtener el audio en Base64');
    const pure = b64.replace(/^data:[^;]+;base64,/, '');
    return this.voice.transcribe(Buffer.from(pure, 'base64'), 'audio.ogg');
  }

  /** Cerebro gpt-4o-mini. Audio entrante -> nota de voz (TTS); texto entrante -> texto. */
  private async responderConOpenAi(phone: string, contenido: string, esAudio: boolean) {
    const respuesta = await this.voice.reply(`wa:${phone}`, contenido);
    if (!respuesta) return { status: 'ignored', reason: 'respuesta_vacia' };

    if (esAudio) {
      const audio = await this.voice.synthesize(respuesta);
      const envio = await this.whatsappService.enviarNotaDeVoz(phone, audio.toString('base64'));
      return { status: 'processed', agente: 'OPENAI', modo: 'voz', transcripcion: contenido, respuesta, envio };
    }

    const envio = await this.whatsappService.enviarTextoSimple(phone, respuesta);
    return { status: 'processed', agente: 'OPENAI', modo: 'texto', respuesta, envio };
  }

  /**
   * Extrae el texto de los distintos tipos de mensaje de WhatsApp (Baileys).
   */
  private extraerTexto(message: any): string | null {
    if (!message) return null;
    if (typeof message === 'string') return message;
    return (
      message.conversation ||
      message.extendedTextMessage?.text ||
      message.imageMessage?.caption ||
      message.videoMessage?.caption ||
      message.documentMessage?.caption ||
      message.buttonsResponseMessage?.selectedDisplayText ||
      message.templateButtonReplyMessage?.selectedDisplayText ||
      message.listResponseMessage?.title ||
      message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      null
    );
  }

  @Post('simulate-incoming')
  @ApiOperation({ summary: 'Simula la llegada de un mensaje de WhatsApp para pruebas de demostración en vivo' })
  async simulateIncoming(@Body() body: { telefono: string; contenido?: string; mensaje?: string; text?: string }) {
    const texto = body.contenido || body.mensaje || body.text || '';
    this.logger.log(`Simulación de mensaje entrante de estudiante: ${body.telefono} -> "${texto}"`);
    return this.enrutarEntrante(String(body.telefono || '').replace(/\D/g, ''), texto);
  }

  /**
   * Live Chat del panel: procesa el mensaje como si viniera del estudiante y
   * despacha la respuesta del Agente PAYERS al WhatsApp real del contacto.
   * Así el panel de cobranza y el celular quedan sincronizados.
   */
  @Post('agent-chat')
  @ApiOperation({
    summary:
      'Procesa un mensaje desde el Live Chat de cobranza y envía la respuesta del Agente PAYERS al WhatsApp real del estudiante',
  })
  async agentChat(@Body() body: { ordenPagoId: number; mensaje?: string; contenido?: string }) {
    const ordenPagoId = Number(body.ordenPagoId);
    const texto = body.mensaje || body.contenido || '';

    const resultado = await this.payersService.procesarChatAgente(ordenPagoId, texto);

    let envio: any = null;
    const telefono = await this.payersService.obtenerTelefonoPorOrden(ordenPagoId);
    if (telefono) {
      const cleanPhone = String(telefono).replace(/\D/g, '');
      envio = await this.whatsappService.enviarTextoSimple(cleanPhone, resultado.respuesta);
      this.logger.log(`→ Live Chat: respuesta del Agente PAYERS despachada a WhatsApp ${cleanPhone}`);
    } else {
      this.logger.warn(
        `Live Chat: no se encontró teléfono para la orden ${ordenPagoId}; la respuesta quedó solo en el panel.`,
      );
    }

    return { ...resultado, envio };
  }
}

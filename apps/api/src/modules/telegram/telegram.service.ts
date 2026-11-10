import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { PayersService } from '../payers/payers.service';

interface ChatSession {
  ordenPagoId: number;
  lastActive: Date;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private token: string;
  private isPolling = false;
  private shouldStopPolling = false;
  private lastUpdateId = 0;
  private readonly chatSessions = new Map<number, ChatSession>();

  constructor(
    @Inject(forwardRef(() => PayersService))
    private readonly payersService: PayersService,
  ) {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  async onModuleInit() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (this.isTokenValid()) {
      this.logger.log(`✓ Token de Telegram configurado. Verificando bot en Telegram...`);
      await this.verificarBotYIniciarPolling();
    } else {
      this.logger.log(`Telegram Bot en modo inactivo (TELEGRAM_BOT_TOKEN no configurado o es placeholder).`);
    }
  }

  onModuleDestroy() {
    this.shouldStopPolling = true;
  }

  private isTokenValid(): boolean {
    return (
      !!this.token &&
      this.token.length > 20 &&
      this.token.includes(':') &&
      !this.token.startsWith('mock_')
    );
  }

  /**
   * Consulta getMe en Telegram y arranca el Long-Polling si el token es válido
   */
  async verificarBotYIniciarPolling() {
    try {
      const url = `https://api.telegram.org/bot${this.token}/getMe`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data?.ok) {
        const botInfo = res.data.result;
        this.logger.log(`🤖 Bot de Telegram conectado exitosamente: @${botInfo.username} (${botInfo.first_name})`);

        // Si no está corriendo el polling y no se especificó usar solo webhook, arrancamos polling
        if (!this.isPolling) {
          this.iniciarLongPolling();
        }
        return { ok: true, bot: botInfo };
      }
    } catch (error: any) {
      this.logger.warn(`Error al conectar con la API de Telegram: ${error.message}`);
      return { ok: false, error: error.message };
    }
    return { ok: false };
  }

  /**
   * Bucle de Long-Polling para desarrollo local (¡sin necesidad de ngrok ni puertos públicos!)
   */
  private async iniciarLongPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.shouldStopPolling = false;
    this.logger.log(`🚀 Iniciando bucle de Long-Polling de Telegram para recibir mensajes en tiempo real...`);

    // Limpiar cualquier webhook previo para permitir getUpdates
    try {
      await axios.get(`https://api.telegram.org/bot${this.token}/deleteWebhook`);
    } catch {
      // Ignorar si no había webhook
    }

    const pollingLoop = async () => {
      while (!this.shouldStopPolling) {
        try {
          const url = `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=25`;
          const response = await axios.get(url, { timeout: 35000 });

          if (response.data?.ok && Array.isArray(response.data.result)) {
            for (const update of response.data.result) {
              this.lastUpdateId = update.update_id;
              if (update.message) {
                await this.procesarMensajeTelegram(update.message);
              }
            }
          }
        } catch (error: any) {
          if (this.shouldStopPolling) break;
          // Esperar 3 segundos antes de reintentar si hubo error de red
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      this.isPolling = false;
      this.logger.log(`Bucle de Long-Polling de Telegram detenido.`);
    };

    pollingLoop();
  }

  /**
   * Procesa un mensaje entrante (desde Polling o desde Webhook)
   */
  async procesarMensajeTelegram(message: any) {
    const chatId = message.chat?.id;
    const text = message.text || '';
    const fromUser = message.from?.first_name || 'Estudiante';

    if (!chatId || !text) return;

    this.logger.log(`[Telegram] Mensaje de @${message.from?.username || fromUser} (${chatId}): "${text}"`);

    // 1. Comando /start o saludo inicial
    if (text === '/start') {
      const bienvenida =
        `👋 ¡Hola **${fromUser}**! Te saluda el Agente Virtual de Cobranza y Activación de **INBESTIGA** 🎓.\n\n` +
        `Puedo ayudarte a:\n` +
        `• 📋 Consultar el estado de tu expediente y cronograma de cuotas\n` +
        `• 💳 Obtener tu enlace oficial de pasarela (Culqi / Tarjeta / Yape / Plin)\n` +
        `• 🏦 Solicitar datos de transferencia bancaria BCP / Interbank\n` +
        `• 📝 Confirmar tu contrato de asesoría y garantías\n\n` +
        `👉 Para comenzar, indícame tu **código de orden** (ejemplo: \`ORD-2026-0001\`) o simplemente hazme tu consulta.`;

      await this.enviarMensaje(chatId, bienvenida);
      return;
    }

    // 2. Resolver o vincular sesión de orden de pago
    let session = this.chatSessions.get(chatId);

    // Si el usuario menciona un código de orden ej. ORD-2026-0041 o ORD 41
    const matchOrden = text.match(/ORD[-_ ]?2026[-_ ]?(\d{1,4})/i) || text.match(/\b(orden\s*#?\s*)(\d{1,3})\b/i);
    if (matchOrden) {
      const num = parseInt(matchOrden[1] || matchOrden[2], 10);
      if (num >= 1 && num <= 104) {
        session = { ordenPagoId: num, lastActive: new Date() };
        this.chatSessions.set(chatId, session);
        this.logger.log(`[Telegram] Chat ${chatId} vinculado a Orden #${num}`);
      }
    }

    // Si no tiene orden vinculada, asignar por defecto la Orden #1 para facilitar la demo
    if (!session) {
      session = { ordenPagoId: 1, lastActive: new Date() };
      this.chatSessions.set(chatId, session);
    }

    // 3. Pasar el mensaje al Agente IA de Cobranza PAYERS
    try {
      const resultado = await this.payersService.procesarChatAgente(session.ordenPagoId, text);

      // Formatear la respuesta para Telegram
      let respuestaFinal = resultado.respuesta;

      // Si se ejecutaron herramientas, agregar pie informativo
      if (resultado.herramientasEjecutadas && resultado.herramientasEjecutadas.length > 0) {
        const toolsNames = resultado.herramientasEjecutadas.map((t: any) => `\`${t.herramienta}\``).join(', ');
        respuestaFinal += `\n\n🛠️ *Herramientas ejecutadas:* ${toolsNames}`;
      }

      await this.enviarMensaje(chatId, respuestaFinal);
    } catch (error: any) {
      this.logger.error(`Error al procesar mensaje en PayersService: ${error.message}`);
      await this.enviarMensaje(
        chatId,
        `Lo siento, ocurrió una incidencia temporal al procesar tu solicitud. Por favor intenta nuevamente en unos momentos.`,
      );
    }
  }

  /**
   * Envía un mensaje a un chat de Telegram
   */
  async enviarMensaje(chatId: number | string, texto: string) {
    if (!this.isTokenValid()) return;

    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: texto,
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      // Fallback sin Markdown si el formateo falla
      try {
        const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
        await axios.post(url, {
          chat_id: chatId,
          text: texto,
        });
      } catch (innerError: any) {
        this.logger.error(`Error al enviar mensaje a Telegram ${chatId}: ${innerError.message}`);
      }
    }
  }

  /**
   * Retorna el estado actual del conector de Telegram
   */
  async getStatus() {
    const configured = this.isTokenValid();
    let botInfo = null;

    if (configured) {
      try {
        const res = await axios.get(`https://api.telegram.org/bot${this.token}/getMe`, { timeout: 5000 });
        if (res.data?.ok) {
          botInfo = res.data.result;
        }
      } catch {}
    }

    return {
      configurado: configured,
      pollingActivo: this.isPolling,
      bot: botInfo,
      sesionesActivas: this.chatSessions.size,
    };
  }
}

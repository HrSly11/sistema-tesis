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
   * Extrae un número celular peruano de 9 dígitos del texto
   */
  private extraerTelefono(texto: string): string | null {
    if (!texto) return null;
    const regex = /(?:(?:\+?51)[\s.-]?)?(9(?:\d[\s.-]?){8})/;
    const match = regex.exec(texto);
    if (match && match[1]) {
      const clean = match[1].replace(/\D/g, '');
      if (clean.length === 9 && clean.startsWith('9')) {
        return clean;
      }
    }
    return null;
  }

  /**
   * Procesa un mensaje entrante (desde Polling o desde Webhook)
   */
  async procesarMensajeTelegram(message: any) {
    const chatId = message.chat?.id;
    let text = (message.text || '').trim();
    const fromUser = message.from?.first_name || 'Estudiante';
    const contactPhone = message.contact?.phone_number;

    if (!chatId) return;
    if (!text && !contactPhone) return;

    this.logger.log(`[Telegram] Mensaje de @${message.from?.username || fromUser} (${chatId}): "${text || contactPhone}"`);

    // 1. Comando /start o saludo inicial
    if (text === '/start') {
      const bienvenida =
        `👋 ¡Hola **${fromUser}**! Te saluda el Agente Virtual de Cobranza y Activación de **INBESTIGA** 🎓.\n\n` +
        `Puedo ayudarte a:\n` +
        `• 📋 Consultar el estado de tu expediente y cronograma de cuotas\n` +
        `• 💳 Obtener tu enlace oficial de pasarela (Culqi / Tarjeta / Yape / Plin)\n` +
        `• 🏦 Solicitar datos de transferencia bancaria BCP / Interbank\n` +
        `• 📝 Confirmar tu contrato de asesoría y garantías\n\n` +
        `👉 *Para identificarte y cargar tu expediente:* \n` +
        `1. Presiona el botón **[📱 Compartir mi número de celular]** abajo, o\n` +
        `2. Escribe tu **número de celular** (ejemplo: \`919632928\` o \`994 910 334\`), o\n` +
        `3. Escribe tu **código de orden** (ejemplo: \`ORD-2026-0042\`).`;

      const keyboard = {
        keyboard: [
          [
            {
              text: '📱 Compartir mi número de celular',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      };

      await this.enviarMensaje(chatId, bienvenida, keyboard);
      return;
    }

    // 2. Identificación por Celular (vía Botón de Contacto o escrito en texto)
    const telDetectado = contactPhone
      ? contactPhone.replace(/\D/g, '').slice(-9)
      : this.extraerTelefono(text);

    if (telDetectado) {
      const expediente = await this.payersService.buscarOrdenPorTelefono(telDetectado);
      if (expediente) {
        this.chatSessions.set(chatId, {
          ordenPagoId: expediente.orden_pago_id,
          lastActive: new Date(),
        });
        this.logger.log(`[Telegram] Chat ${chatId} identificado como ${expediente.nombres} ${expediente.apellidos} (Orden #${expediente.orden_pago_id})`);

        const mensajeConfirmacion =
          `✅ *¡Identidad confirmada, ${expediente.nombres} ${expediente.apellidos}!* 🎓\n\n` +
          `📋 *Expediente vinculado:* \`${expediente.codigo_orden}\`\n` +
          `• *Servicio:* ${expediente.servicio_nombre}\n` +
          `• *Estado:* \`${expediente.estado}\`\n` +
          `• *Total comprometido:* S/ ${Number(expediente.monto_comprometido).toFixed(2)}\n\n` +
          `He vinculado tu sesión de forma segura. ¿En qué te puedo ayudar hoy? (Por ejemplo: ver cuotas, enlace de pago Culqi, pagar con Yape o reportar voucher de transferencia).`;

        // Si el usuario envió SOLO el teléfono o el botón de contacto
        const textoSinTelefono = text.replace(/(?:(?:\+?51)[\s.-]?)?(9(?:\d[\s.-]?){8})/, '').trim();
        if (!textoSinTelefono || contactPhone) {
          await this.enviarMensaje(chatId, mensajeConfirmacion, { remove_keyboard: true });
          return;
        } else {
          // El usuario mandó teléfono + consulta en el mismo mensaje
          await this.enviarMensaje(
            chatId,
            `✅ *Identidad verificada:* ${expediente.nombres} ${expediente.apellidos} (\`${expediente.codigo_orden}\`)`,
            { remove_keyboard: true },
          );
          text = textoSinTelefono;
        }
      } else {
        await this.enviarMensaje(
          chatId,
          `⚠️ No encontramos ningún expediente registrado con el número *${telDetectado}*.\n\nPor favor verifica que sea el número con el que contrataste tu asesoría o indícanos directamente tu código de orden (ejemplo: \`ORD-2026-0042\`).`,
        );
        return;
      }
    }

    // 3. Identificación por Código de Orden explícito (ej. ORD-2026-0042 o ORD 42)
    const matchOrden = text.match(/ORD[-_ ]?2026[-_ ]?(\d{1,4})/i) || text.match(/\b(orden\s*#?\s*)(\d{1,3})\b/i);
    if (matchOrden) {
      const num = parseInt(matchOrden[1] || matchOrden[2], 10);
      if (num >= 1 && num <= 104) {
        this.chatSessions.set(chatId, { ordenPagoId: num, lastActive: new Date() });
        this.logger.log(`[Telegram] Chat ${chatId} vinculado a Orden #${num} por código de orden`);
      }
    }

    // 4. Verificar si ya existe una sesión identificada
    let session = this.chatSessions.get(chatId);

    // Si aún no está identificado y la consulta no contiene orden ni teléfono
    if (!session) {
      const promptIdentificacion =
        `👋 ¡Hola ${fromUser}! Para brindarte información sobre tus cuotas o emitir tu enlace de pago oficial, necesito identificar tu expediente.\n\n` +
        `Por favor, indícame tu **número de celular** (ejemplo: \`919632928\` o \`994 910 334\`), tu **código de orden** (ej: \`ORD-2026-0042\`), o presiona el botón inferior para compartir tu número.`;

      const keyboard = {
        keyboard: [
          [
            {
              text: '📱 Compartir mi número de celular',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      };

      await this.enviarMensaje(chatId, promptIdentificacion, keyboard);
      return;
    }

    // 5. Pasar el mensaje al Agente IA de Cobranza PAYERS
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
  async enviarMensaje(chatId: number | string, texto: string, replyMarkup?: any) {
    if (!this.isTokenValid()) return;

    const payload: any = {
      chat_id: chatId,
      text: texto,
      parse_mode: 'Markdown',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
      await axios.post(url, payload);
    } catch (error: any) {
      // Fallback sin Markdown si el formateo falla
      try {
        const fallbackPayload: any = {
          chat_id: chatId,
          text: texto,
        };
        if (replyMarkup) fallbackPayload.reply_markup = replyMarkup;
        const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
        await axios.post(url, fallbackPayload);
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

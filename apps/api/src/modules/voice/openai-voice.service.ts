import { Injectable, Logger } from '@nestjs/common';
import OpenAI, { toFile } from 'openai';

export const STT_MODEL = 'gpt-4o-mini-transcribe';
export const LLM_MODEL = 'gpt-4o-mini';
export const TTS_MODEL = 'gpt-4o-mini-tts';

const MAX_HISTORY = 6;

const SYSTEM_PROMPT =
  process.env.OPENAI_SYSTEM_PROMPT ||
  'Eres un asistente virtual amable. Responde siempre en español, de forma concisa y natural, ' +
    'con frases cortas como si hablaras por teléfono. Usa solo texto plano: sin Markdown, sin asteriscos, ' +
    'sin listas, sin viñetas, sin emojis ni encabezados. Tu respuesta será leída en voz alta.';

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Pipeline OpenAI: STT (gpt-4o-mini-transcribe) -> LLM (gpt-4o-mini) -> TTS (gpt-4o-mini-tts).
 * Mantiene en memoria los últimos 6 mensajes por usuario.
 */
@Injectable()
export class OpenAiVoiceService {
  private readonly logger = new Logger(OpenAiVoiceService.name);
  private readonly client: OpenAI | null;
  private readonly history = new Map<string, HistoryItem[]>();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('OPENAI_API_KEY no configurada: pipeline de voz OpenAI inactivo.');
    }
  }

  get enabled(): boolean {
    return !!this.client && process.env.OPENAI_AGENT_ENABLED !== 'false';
  }

  /** STT: audio .ogg -> texto en español. */
  async transcribe(audio: Buffer, filename = 'audio.ogg'): Promise<string> {
    const file = await toFile(audio, filename, { type: 'audio/ogg' });
    const res = await this.client!.audio.transcriptions.create({
      model: STT_MODEL,
      file,
      language: 'es',
    });
    return (res.text || '').trim();
  }

  /** LLM: responde con historial acotado a los últimos 6 mensajes del usuario. */
  async reply(userKey: string, text: string, systemPromptOverride?: string): Promise<string> {
    const past = this.history.get(userKey) || [];
    const systemContent = systemPromptOverride || SYSTEM_PROMPT;
    const completion = await this.client!.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 250,
      messages: [
        { role: 'system', content: systemContent },
        ...past,
        { role: 'user', content: text },
      ],
    });
    const answer = (completion.choices[0]?.message?.content || '').trim();

    const updated = [...past, { role: 'user' as const, content: text }];
    if (answer) updated.push({ role: 'assistant' as const, content: answer });
    this.history.set(userKey, updated.slice(-MAX_HISTORY));

    return answer;
  }

  /**
   * Cerebro directo de PAYERS con gpt-4o-mini:
   * Aplica max_tokens=250, memoria de 6 mensajes y regla de texto plano para TTS/voz.
   */
  async generarRespuestaPayers(
    userKey: string,
    contextPrompt: string,
    mensajeUsuario: string,
  ): Promise<string> {
    const past = this.history.get(userKey) || [];
    const systemInstruction =
      `${contextPrompt}\n\n` +
      `REGLA DE FORMATO ESTRICTA PARA VOZ:\n` +
      `- Responde de forma concisa, cálida y natural, apto para lectura en voz alta.\n` +
      `- Usa estrictamente TEXTO PLANO: NO uses Markdown, asteriscos (*), almohadillas (#), viñetas ni listas.`;

    const completion = await this.client!.chat.completions.create({
      model: LLM_MODEL,
      max_tokens: 250,
      messages: [
        { role: 'system', content: systemInstruction },
        ...past,
        { role: 'user', content: mensajeUsuario },
      ],
    });
    const respuesta = (completion.choices[0]?.message?.content || '').trim();

    const updated = [...past, { role: 'user' as const, content: mensajeUsuario }];
    if (respuesta) updated.push({ role: 'assistant' as const, content: respuesta });
    this.history.set(userKey, updated.slice(-MAX_HISTORY));

    return respuesta;
  }

  /** TTS: texto -> Ogg/Opus (apto para notas de voz). */
  async synthesize(text: string): Promise<Buffer> {
    const res = await this.client!.audio.speech.create({
      model: TTS_MODEL,
      voice: 'coral',
      input: text,
      response_format: 'opus',
      instructions: 'Habla en español con un tono natural, cálido y conversacional.',
    });
    return Buffer.from(await res.arrayBuffer());
  }
}

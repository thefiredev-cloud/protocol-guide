/**
 * Chat History Service
 * Manages chat session and message persistence
 */

import { db } from '../../../lib/db/client';
import { createLogger } from '../../../lib/log';

import { sanitizeMessage } from './phi-sanitizer';

const logger = createLogger('chat-history');

/**
 * Citation reference in a message
 */
interface Citation {
  title: string;
  category: string;
  subcategory?: string;
  protocolCode?: string;
}

/**
 * Chat history service interface
 */
export interface ChatHistoryService {
  createSession(params: {
    userId?: string;
    deviceFingerprint?: string;
    providerLevel?: 'EMT' | 'Paramedic';
    title?: string;
  }): Promise<string | null>;

  saveMessage(params: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    responseTimeMs?: number;
  }): Promise<void>;

  listSessions(params: {
    userId?: string;
    deviceFingerprint?: string;
    limit?: number;
    offset?: number;
  }): Promise<
    Array<{
      id: string;
      title: string | null;
      messageCount: number;
      lastMessageAt: string;
      preview: string | null;
    }>
  >;

  getSession(sessionId: string): Promise<{
    id: string;
    title: string | null;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      citations?: Citation[];
    }>;
  } | null>;

  deleteSession(sessionId: string): Promise<boolean>;
}

/**
 * Chat history service implementation
 */
class ChatHistoryServiceImpl implements ChatHistoryService {
  /**
   * Create a new chat session
   */
  async createSession(params: {
    userId?: string;
    deviceFingerprint?: string;
    providerLevel?: 'EMT' | 'Paramedic';
    title?: string;
  }): Promise<string | null> {
    if (!db.isAvailable) {
      logger.debug('Database not available, skipping session creation');
      return null;
    }

    try {
      const { data, error } = await db.admin
        .from('chat_sessions')
        .insert({
          user_id: params.userId ?? null,
          device_fingerprint: params.userId ? null : params.deviceFingerprint,
          title: params.title ?? null,
          provider_level: params.providerLevel ?? 'Paramedic',
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Failed to create session', { error: error.message });
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Failed to create session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Save a message to a session
   */
  async saveMessage(params: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    responseTimeMs?: number;
  }): Promise<void> {
    if (!db.isAvailable) {
      return;
    }

    try {
      // Sanitize user messages before storage
      const sanitizedContent =
        params.role === 'user'
          ? sanitizeMessage(params.content)
          : params.content;

      const protocolsReferenced =
        params.citations
          ?.filter((c) => c.protocolCode)
          .map((c) => c.protocolCode!) ?? [];

      await (db.admin.from('chat_messages') as any).insert({
        session_id: params.sessionId,
        role: params.role,
        content: sanitizedContent,
        is_sanitized: params.role === 'user',
        citations: params.citations as any,
        protocols_referenced: protocolsReferenced,
        response_time_ms: params.responseTimeMs ?? null,
      });
    } catch (error) {
      logger.error('Failed to save message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * List user's chat sessions
   */
  async listSessions(params: {
    userId?: string;
    deviceFingerprint?: string;
    limit?: number;
    offset?: number;
  }): Promise<
    Array<{
      id: string;
      title: string | null;
      messageCount: number;
      lastMessageAt: string;
      preview: string | null;
    }>
  > {
    if (!db.isAvailable) {
      return [];
    }

    try {
      const { data, error } = await db.admin.rpc('get_user_chat_history', {
        p_user_id: params.userId || undefined,
        p_device_fingerprint: params.deviceFingerprint || undefined,
        p_limit: params.limit ?? 20,
        p_offset: params.offset ?? 0,
      });

      if (error) {
        logger.error('Failed to list sessions', { error: error.message });
        return [];
      }

      return (data ?? []).map(
        (row: {
          session_id: string;
          title: string | null;
          message_count: number;
          last_message_at: string;
          preview: string | null;
        }) => ({
          id: row.session_id,
          title: row.title,
          messageCount: Number(row.message_count),
          lastMessageAt: row.last_message_at,
          preview: row.preview,
        })
      );
    } catch (error) {
      logger.error('Failed to list sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Get a session with all messages
   */
  async getSession(sessionId: string): Promise<{
    id: string;
    title: string | null;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      citations?: Citation[];
    }>;
  } | null> {
    if (!db.isAvailable) {
      return null;
    }

    try {
      const { data, error } = await db.admin.rpc(
        'get_chat_session_with_messages',
        {
          p_session_id: sessionId,
        }
      );

      if (error || !data?.length) {
        return null;
      }

      return {
        id: sessionId,
        title: data[0].session_title,
        messages: data
          .filter(
            (row: { message_id: string | null }) => row.message_id !== null
          )
          .map(
            (row: any) => ({
              role: row.role as 'user' | 'assistant',
              content: row.content,
              citations: row.citations as Citation[],
            })
          ),
      };
    } catch (error) {
      logger.error('Failed to get session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Soft delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    if (!db.isAvailable) {
      return false;
    }

    try {
      const { error } = await db.admin
        .from('chat_sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        logger.error('Failed to delete session', { error: error.message });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to delete session', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

/**
 * Singleton chat history service instance
 */
export const chatHistoryService = new ChatHistoryServiceImpl();

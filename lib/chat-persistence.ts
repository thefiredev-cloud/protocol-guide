/**
 * Chat Persistence Service
 * Saves chat sessions and messages to Supabase for QA/QI tracking.
 */

import { supabase, isSupabaseConfigured } from './supabase';

// Session metadata when creating a new session
export interface SessionMetadata {
  userId: string;
  userEmail: string;
  station?: string;
  department?: string;
  patientContextActive?: boolean;
}

// Message data for persistence
export interface MessagePersistenceData {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  retrievedChunkIds?: string[];
  confidence?: number;
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  citations?: Array<{ ref: string; title: string; protocolId: string }>;
  groundingScore?: number;
  responseTimeMs?: number;
  protocolsReferenced?: string[];
  isDeclineResponse?: boolean;
  hasWarning?: boolean;
}

/**
 * Creates a new chat session in Supabase.
 * @returns The session ID if successful, null otherwise.
 */
export async function createChatSession(metadata: SessionMetadata): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - session not persisted');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: metadata.userId,
        user_email: metadata.userEmail,
        station: metadata.station || null,
        department: metadata.department || null,
        patient_context_active: metadata.patientContextActive || false,
        started_at: new Date().toISOString(),
        message_count: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create chat session:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error creating chat session:', err);
    return null;
  }
}

/**
 * Persists a message to Supabase.
 * @returns The message ID if successful, null otherwise.
 */
export async function persistMessage(data: MessagePersistenceData): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: insertedMsg, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: data.sessionId,
        role: data.role,
        content: data.content,
        retrieved_chunks: data.retrievedChunkIds || null,
        confidence: data.confidence || null,
        confidence_level: data.confidenceLevel || null,
        citations: data.citations || null,
        grounding_score: data.groundingScore || null,
        response_time_ms: data.responseTimeMs || null,
        protocols_referenced: data.protocolsReferenced || null,
        is_decline_response: data.isDeclineResponse || false,
        has_warning: data.hasWarning || false,
        qa_status: 'pending',
        qa_reviewed: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to persist message:', error);
      return null;
    }

    // Update session message count
    if (insertedMsg?.id) {
      await updateSessionStats(data.sessionId);
    }

    return insertedMsg?.id || null;
  } catch (err) {
    console.error('Error persisting message:', err);
    return null;
  }
}

/**
 * Updates session statistics (message count, last message time).
 */
export async function updateSessionStats(sessionId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    // Get current message count for this session
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    // Update session
    await supabase
      .from('chat_sessions')
      .update({
        message_count: count || 0,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
  } catch (err) {
    console.error('Error updating session stats:', err);
  }
}

/**
 * Marks a session as ended.
 */
export async function endSession(sessionId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    const startTime = session?.started_at ? new Date(session.started_at).getTime() : Date.now();
    const durationMs = Date.now() - startTime;

    await supabase
      .from('chat_sessions')
      .update({
        ended_at: new Date().toISOString(),
        session_duration_ms: durationMs,
      })
      .eq('id', sessionId);
  } catch (err) {
    console.error('Error ending session:', err);
  }
}

/**
 * Logs an audit event for compliance tracking.
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource,
      outcome: 'success',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
}

/**
 * Retrieves a session by ID.
 */
export async function getSession(sessionId: string) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error getting session:', err);
    return null;
  }
}

import { supabase, isSupabaseConfigured } from './supabase';

export interface UserMetrics {
  email: string;
  name: string;
  sessionCount: number;
  messageCount: number;
  lastActive: string | null;
}

export interface OverviewStats {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  positiveRatings: number;
  negativeRatings: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  confidence: number | null;
  citations: string[] | null;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  startedAt: string;
  lastMessageAt: string | null;
  messageCount: number;
}

export async function getOverviewStats(): Promise<OverviewStats | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // Get total users from auth (via distinct user_ids in sessions)
    const { count: userCount } = await supabase
      .from('chat_sessions')
      .select('user_id', { count: 'exact', head: true });

    // Get unique user count
    const { data: uniqueUsers } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .limit(10000);

    const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || []);

    // Get total sessions
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    // Get total messages
    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });

    // Get feedback breakdown
    const { data: feedback } = await supabase
      .from('user_feedback')
      .select('rating');

    const positiveRatings = feedback?.filter(f => f.rating === 'positive').length || 0;
    const negativeRatings = feedback?.filter(f => f.rating === 'negative').length || 0;

    return {
      totalUsers: uniqueUserIds.size,
      totalSessions: sessionCount || 0,
      totalMessages: messageCount || 0,
      positiveRatings,
      negativeRatings
    };
  } catch (err) {
    console.error('Failed to fetch overview stats:', err);
    return null;
  }
}

export async function getAllUsersWithMetrics(): Promise<UserMetrics[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    // Get all sessions with user info
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('user_id, started_at, last_message_at, message_count')
      .order('last_message_at', { ascending: false });

    if (error || !sessions) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }

    // Aggregate by user
    const userMap = new Map<string, {
      sessionCount: number;
      messageCount: number;
      lastActive: string | null;
    }>();

    for (const session of sessions) {
      const userId = session.user_id;
      const existing = userMap.get(userId);

      if (existing) {
        existing.sessionCount++;
        existing.messageCount += session.message_count || 0;
        if (!existing.lastActive || (session.last_message_at && session.last_message_at > existing.lastActive)) {
          existing.lastActive = session.last_message_at;
        }
      } else {
        userMap.set(userId, {
          sessionCount: 1,
          messageCount: session.message_count || 0,
          lastActive: session.last_message_at
        });
      }
    }

    // Convert to array
    const users: UserMetrics[] = [];
    for (const [email, metrics] of userMap) {
      users.push({
        email,
        name: email.split('@')[0], // Extract name from email for now
        ...metrics
      });
    }

    // Sort by last active
    users.sort((a, b) => {
      if (!a.lastActive) return 1;
      if (!b.lastActive) return -1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

    return users;
  } catch (err) {
    console.error('Failed to fetch users with metrics:', err);
    return [];
  }
}

export async function getUserSessions(userId: string): Promise<UserSession[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, user_id, started_at, last_message_at, message_count')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error || !data) {
      console.error('Failed to fetch user sessions:', error);
      return [];
    }

    return data.map(s => ({
      id: s.id,
      userId: s.user_id,
      startedAt: s.started_at,
      lastMessageAt: s.last_message_at,
      messageCount: s.message_count || 0
    }));
  } catch (err) {
    console.error('Failed to fetch user sessions:', err);
    return [];
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, session_id, role, content, confidence, citations, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Failed to fetch messages:', error);
      return [];
    }

    return data.map(m => ({
      id: m.id,
      sessionId: m.session_id,
      role: m.role,
      content: m.content,
      confidence: m.confidence,
      citations: m.citations,
      createdAt: m.created_at
    }));
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    return [];
  }
}

export async function getUserMessages(userId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    // First get all sessions for this user
    const sessions = await getUserSessions(userId);
    if (sessions.length === 0) return [];

    // Then get messages for all sessions
    const sessionIds = sessions.map(s => s.id);

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, session_id, role, content, confidence, citations, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      console.error('Failed to fetch user messages:', error);
      return [];
    }

    return data.map(m => ({
      id: m.id,
      sessionId: m.session_id,
      role: m.role,
      content: m.content,
      confidence: m.confidence,
      citations: m.citations,
      createdAt: m.created_at
    }));
  } catch (err) {
    console.error('Failed to fetch user messages:', err);
    return [];
  }
}

export async function getFeedbackAnalytics() {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('rating, issue_type, feedback_text, query, response, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch feedback:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch feedback analytics:', err);
    return null;
  }
}

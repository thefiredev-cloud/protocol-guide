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
    const { count: userCount, error: userCountError } = await supabase
      .from('chat_sessions')
      .select('user_id', { count: 'exact', head: true });

    if (userCountError) {
      console.error('Failed to get user count:', userCountError);
    }

    // Get unique user count
    const { data: uniqueUsers, error: uniqueUsersError } = await supabase
      .from('chat_sessions')
      .select('user_id')
      .limit(10000);

    if (uniqueUsersError) {
      console.error('Failed to get unique users:', uniqueUsersError);
    }

    const uniqueUserIds = new Set(uniqueUsers?.map(u => u.user_id) || []);

    // Get total sessions
    const { count: sessionCount, error: sessionCountError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    if (sessionCountError) {
      console.error('Failed to get session count:', sessionCountError);
    }

    // Get total messages
    const { count: messageCount, error: messageCountError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });

    if (messageCountError) {
      console.error('Failed to get message count:', messageCountError);
    }

    // Get feedback breakdown
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('rating');

    if (feedbackError) {
      console.error('Failed to get feedback:', feedbackError);
    }

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
    for (const [email, metrics] of Array.from(userMap.entries())) {
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

// ============================================
// QA/QI ANALYTICS FUNCTIONS
// ============================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DailyMetrics {
  queryDate: string;
  station: string | null;
  department: string | null;
  userQueries: number;
  aiResponses: number;
  avgConfidence: number | null;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  declineCount: number;
  warningCount: number;
  avgResponseTimeMs: number | null;
  uniqueSessions: number;
  uniqueUsers: number;
}

export interface StationMetrics {
  station: string;
  totalSessions: number;
  totalQueries: number;
  avgConfidence: number | null;
  highConfidenceCount: number;
  lowConfidenceCount: number;
  declineCount: number;
  positiveFeedback: number;
  negativeFeedback: number;
  lastActivity: string | null;
}

export interface QAQueueItem {
  messageId: string;
  sessionId: string;
  userEmail: string | null;
  station: string | null;
  department: string | null;
  content: string;
  confidence: number | null;
  confidenceLevel: string | null;
  groundingScore: number | null;
  isDeclineResponse: boolean;
  hasWarning: boolean;
  protocolsReferenced: string[] | null;
  responseTimeMs: number | null;
  qaStatus: string;
  createdAt: string;
  feedbackRating: string | null;
  feedbackIssue: string | null;
  feedbackText: string | null;
}

export interface ConfidenceDistribution {
  high: number;
  medium: number;
  low: number;
  total: number;
}

/**
 * Get daily chat metrics from the pre-computed view.
 */
export async function getDailyMetrics(dateRange?: DateRange): Promise<DailyMetrics[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from('daily_chat_metrics')
      .select('*')
      .order('query_date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('query_date', dateRange.startDate.toISOString().split('T')[0])
        .lte('query_date', dateRange.endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query.limit(90);

    if (error) {
      console.error('Failed to fetch daily metrics:', error);
      return [];
    }

    return (data || []).map(row => ({
      queryDate: row.query_date,
      station: row.station,
      department: row.department,
      userQueries: row.user_queries || 0,
      aiResponses: row.ai_responses || 0,
      avgConfidence: row.avg_confidence,
      highConfidenceCount: row.high_confidence_count || 0,
      mediumConfidenceCount: row.medium_confidence_count || 0,
      lowConfidenceCount: row.low_confidence_count || 0,
      declineCount: row.decline_count || 0,
      warningCount: row.warning_count || 0,
      avgResponseTimeMs: row.avg_response_time_ms,
      uniqueSessions: row.unique_sessions || 0,
      uniqueUsers: row.unique_users || 0,
    }));
  } catch (err) {
    console.error('Error fetching daily metrics:', err);
    return [];
  }
}

/**
 * Get station-level performance metrics.
 */
export async function getStationMetrics(): Promise<StationMetrics[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('station_performance')
      .select('*')
      .order('total_queries', { ascending: false });

    if (error) {
      console.error('Failed to fetch station metrics:', error);
      return [];
    }

    return (data || []).map(row => ({
      station: row.station,
      totalSessions: row.total_sessions || 0,
      totalQueries: row.total_queries || 0,
      avgConfidence: row.avg_confidence,
      highConfidenceCount: row.high_confidence_count || 0,
      lowConfidenceCount: row.low_confidence_count || 0,
      declineCount: row.decline_count || 0,
      positiveFeedback: row.positive_feedback || 0,
      negativeFeedback: row.negative_feedback || 0,
      lastActivity: row.last_activity,
    }));
  } catch (err) {
    console.error('Error fetching station metrics:', err);
    return [];
  }
}

/**
 * Get messages requiring QA review.
 */
export async function getQAValidationQueue(limit = 50): Promise<QAQueueItem[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('qa_validation_queue')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Failed to fetch QA queue:', error);
      return [];
    }

    return (data || []).map(row => ({
      messageId: row.message_id,
      sessionId: row.session_id,
      userEmail: row.user_email,
      station: row.station,
      department: row.department,
      content: row.content,
      confidence: row.confidence,
      confidenceLevel: row.confidence_level,
      groundingScore: row.grounding_score,
      isDeclineResponse: row.is_decline_response || false,
      hasWarning: row.has_warning || false,
      protocolsReferenced: row.protocols_referenced,
      responseTimeMs: row.response_time_ms,
      qaStatus: row.qa_status || 'pending',
      createdAt: row.created_at,
      feedbackRating: row.feedback_rating,
      feedbackIssue: row.feedback_issue,
      feedbackText: row.feedback_text,
    }));
  } catch (err) {
    console.error('Error fetching QA queue:', err);
    return [];
  }
}

/**
 * Get confidence level distribution.
 */
export async function getConfidenceDistribution(): Promise<ConfidenceDistribution> {
  if (!isSupabaseConfigured()) {
    return { high: 0, medium: 0, low: 0, total: 0 };
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('confidence_level')
      .eq('role', 'assistant')
      .not('confidence_level', 'is', null);

    if (error) {
      console.error('Failed to fetch confidence distribution:', error);
      return { high: 0, medium: 0, low: 0, total: 0 };
    }

    const distribution = {
      high: 0,
      medium: 0,
      low: 0,
      total: data?.length || 0,
    };

    for (const row of data || []) {
      if (row.confidence_level === 'HIGH') distribution.high++;
      else if (row.confidence_level === 'MEDIUM') distribution.medium++;
      else if (row.confidence_level === 'LOW') distribution.low++;
    }

    return distribution;
  } catch (err) {
    console.error('Error fetching confidence distribution:', err);
    return { high: 0, medium: 0, low: 0, total: 0 };
  }
}

/**
 * Update QA review status for a message.
 */
export async function updateQAStatus(
  messageId: string,
  status: 'approved' | 'flagged' | 'escalated',
  reviewedBy: string,
  notes?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        qa_status: status,
        qa_reviewed: true,
        qa_reviewed_by: reviewedBy,
        qa_reviewed_at: new Date().toISOString(),
        qa_notes: notes || null,
      })
      .eq('id', messageId);

    if (error) {
      console.error('Failed to update QA status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error updating QA status:', err);
    return false;
  }
}

/**
 * Get protocol usage statistics.
 */
export async function getProtocolUsageStats(limit = 20): Promise<Array<{
  protocolId: string;
  protocolRef: string;
  protocolTitle: string | null;
  queryCount: number;
  avgConfidence: number | null;
  positiveFeedback: number;
  negativeFeedback: number;
}>> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('protocol_usage_stats')
      .select('*')
      .order('query_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch protocol usage:', error);
      return [];
    }

    // Aggregate by protocol_id (across dates)
    const aggregated = new Map<string, {
      protocolId: string;
      protocolRef: string;
      protocolTitle: string | null;
      queryCount: number;
      totalConfidence: number;
      confidenceCount: number;
      positiveFeedback: number;
      negativeFeedback: number;
    }>();

    for (const row of data || []) {
      const existing = aggregated.get(row.protocol_id);
      if (existing) {
        existing.queryCount += row.query_count || 0;
        if (row.avg_confidence) {
          existing.totalConfidence += row.avg_confidence;
          existing.confidenceCount++;
        }
        existing.positiveFeedback += row.positive_feedback_count || 0;
        existing.negativeFeedback += row.negative_feedback_count || 0;
      } else {
        aggregated.set(row.protocol_id, {
          protocolId: row.protocol_id,
          protocolRef: row.protocol_ref,
          protocolTitle: row.protocol_title,
          queryCount: row.query_count || 0,
          totalConfidence: row.avg_confidence || 0,
          confidenceCount: row.avg_confidence ? 1 : 0,
          positiveFeedback: row.positive_feedback_count || 0,
          negativeFeedback: row.negative_feedback_count || 0,
        });
      }
    }

    return Array.from(aggregated.values())
      .map(p => ({
        protocolId: p.protocolId,
        protocolRef: p.protocolRef,
        protocolTitle: p.protocolTitle,
        queryCount: p.queryCount,
        avgConfidence: p.confidenceCount > 0 ? p.totalConfidence / p.confidenceCount : null,
        positiveFeedback: p.positiveFeedback,
        negativeFeedback: p.negativeFeedback,
      }))
      .sort((a, b) => b.queryCount - a.queryCount);
  } catch (err) {
    console.error('Error fetching protocol usage:', err);
    return [];
  }
}

/**
 * Export conversations to CSV format.
 */
export async function exportConversationsCSV(dateRange: DateRange): Promise<string> {
  if (!isSupabaseConfigured()) return '';

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        session_id,
        role,
        content,
        confidence,
        confidence_level,
        protocols_referenced,
        is_decline_response,
        has_warning,
        qa_status,
        created_at,
        chat_sessions!inner(user_email, station, department)
      `)
      .gte('created_at', dateRange.startDate.toISOString())
      .lte('created_at', dateRange.endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to export conversations:', error);
      return '';
    }

    // Build CSV
    const headers = [
      'Message ID',
      'Session ID',
      'User Email',
      'Station',
      'Department',
      'Role',
      'Content',
      'Confidence',
      'Confidence Level',
      'Protocols Referenced',
      'Is Decline',
      'Has Warning',
      'QA Status',
      'Created At',
    ];

    const rows = (data || []).map(row => {
      const session = row.chat_sessions as any;
      return [
        row.id,
        row.session_id,
        session?.user_email || '',
        session?.station || '',
        session?.department || '',
        row.role,
        `"${(row.content || '').replace(/"/g, '""').substring(0, 500)}"`,
        row.confidence || '',
        row.confidence_level || '',
        (row.protocols_referenced || []).join('; '),
        row.is_decline_response ? 'Yes' : 'No',
        row.has_warning ? 'Yes' : 'No',
        row.qa_status || '',
        row.created_at,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  } catch (err) {
    console.error('Error exporting conversations:', err);
    return '';
  }
}

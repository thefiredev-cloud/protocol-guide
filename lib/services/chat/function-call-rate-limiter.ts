/**
 * FunctionCallRateLimiter tracks and limits function calls per chat session.
 * Prevents excessive LLM iterations and controls costs.
 * Limit: Max 3 function calls per chat session
 */

import { createLogger } from "@/lib/log";
import { metrics } from "@/lib/managers/metrics-manager";

type SessionState = {
  callCount: number;
  firstCallAt: number;
  lastCallAt: number;
};

export class FunctionCallRateLimiter {
  private readonly sessions = new Map<string, SessionState>();
  private readonly logger = createLogger("FunctionCallRateLimiter");
  private readonly maxCallsPerSession = 3;
  private readonly sessionTtlMs = 30 * 60 * 1000; // 30 minutes

  /**
   * Check if a function call is allowed for this session
   */
  public check(sessionId: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const session = this.sessions.get(sessionId);
    const now = Date.now();

    // New session or expired session
    if (!session || now - session.lastCallAt > this.sessionTtlMs) {
      const nextSession: SessionState = {
        callCount: 1,
        firstCallAt: now,
        lastCallAt: now,
      };
      this.sessions.set(sessionId, nextSession);
      metrics.inc("protocol.tool.calls.allowed");
      metrics.observe("protocol.tool.calls.per_session", nextSession.callCount);
      return {
        allowed: true,
        remaining: this.maxCallsPerSession - nextSession.callCount,
        resetAt: now + this.sessionTtlMs,
      };
    }

    // Check if limit exceeded
    if (session.callCount >= this.maxCallsPerSession) {
      metrics.inc("protocol.tool.calls.rate_limited");
      this.logger.warn("Function call rate limit exceeded", {
        sessionId,
        callCount: session.callCount,
        maxCalls: this.maxCallsPerSession,
      });
      return {
        allowed: false,
        remaining: 0,
        resetAt: session.lastCallAt + this.sessionTtlMs,
      };
    }

    // Increment call count
    session.callCount += 1;
    session.lastCallAt = now;
    metrics.inc("protocol.tool.calls.allowed");
    metrics.observe("protocol.tool.calls.per_session", session.callCount);

    return {
      allowed: true,
      remaining: this.maxCallsPerSession - session.callCount,
      resetAt: session.lastCallAt + this.sessionTtlMs,
    };
  }

  /**
   * Record a function call (called after successful execution)
   */
  public recordCall(sessionId: string, toolName: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      metrics.inc(`protocol.tool.calls.by_name.${toolName}`);
      this.logger.debug("Function call recorded", {
        sessionId,
        toolName,
        callCount: session.callCount,
      });
    }
  }

  /**
   * Clear session (useful for testing or manual reset)
   */
  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Cleanup expired sessions
   */
  public cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastCallAt > this.sessionTtlMs) {
        this.sessions.delete(sessionId);
        removed += 1;
      }
    }

    if (removed > 0) {
      this.logger.debug("Cleaned up expired sessions", { removed, remaining: this.sessions.size });
    }
  }

  /**
   * Get session statistics
   */
  public getSessionStats(sessionId: string): SessionState | null {
    return this.sessions.get(sessionId) ?? null;
  }

  /**
   * Get global statistics
   */
  public getStats(): {
    activeSessions: number;
    totalSessions: number;
  } {
    return {
      activeSessions: this.sessions.size,
      totalSessions: this.sessions.size,
    };
  }
}

// Singleton instance
export const functionCallRateLimiter = new FunctionCallRateLimiter();

// Periodic cleanup (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    functionCallRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

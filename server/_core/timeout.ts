/**
 * Protocol Guide - Request Timeout Middleware
 *
 * Ensures all requests complete within a reasonable time frame.
 * Prevents hanging connections and resource exhaustion.
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export interface TimeoutConfig {
  /** Timeout in milliseconds (default: 30000 = 30s) */
  timeout?: number;
  /** Custom timeout message */
  message?: string;
}

/**
 * Creates a request timeout middleware
 */
export function createTimeoutMiddleware(config: TimeoutConfig = {}) {
  const { timeout = 30000, message = "Request timeout" } = config;

  return function timeoutMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Don't timeout health checks or webhook endpoints
    if (req.path === "/api/health" || req.path.includes("/webhook")) {
      next();
      return;
    }

    const startTime = Date.now();
    let timedOut = false;

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (res.headersSent) {
        return;
      }

      timedOut = true;
      const duration = Date.now() - startTime;

      logger.warn({
        method: req.method,
        path: req.path,
        duration,
        timeout,
      }, "Request timed out");

      res.status(408).json({
        error: "REQUEST_TIMEOUT",
        message,
        timeout: timeout / 1000,
      });
    }, timeout);

    // Clear timeout on response finish
    const originalEnd = res.end;
    res.end = function (this: Response, ...args: any[]): Response {
      clearTimeout(timeoutId);

      if (!timedOut) {
        const duration = Date.now() - startTime;

        // Log slow requests (>5s)
        if (duration > 5000) {
          logger.warn({
            method: req.method,
            path: req.path,
            duration,
          }, "Slow request detected");
        }
      }

      return originalEnd.apply(this, args);
    };

    next();
  };
}

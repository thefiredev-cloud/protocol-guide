/**
 * Next.js Instrumentation
 * Initializes Sentry for server-side error tracking
 *
 * This file is automatically loaded by Next.js App Router
 * to set up monitoring before the application starts.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  err: Error,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; revalidateReason?: string }
) => {
  const Sentry = await import("@sentry/nextjs");

  Sentry.captureException(err, {
    extra: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      revalidateReason: context.revalidateReason,
    },
  });
};

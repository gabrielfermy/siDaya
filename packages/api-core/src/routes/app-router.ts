import http from 'http';
import { handleCors, sendJson } from '../middleware/cors.middleware';

export type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  params: Record<string, string>,
  query: Record<string, string>,
) => Promise<void> | void;

interface RouteDefinition {
  method: string;
  path: string;
  regex: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class AppRouter {
  private routes: RouteDefinition[] = [];

  public get(path: string, handler: RouteHandler): this {
    return this.register('GET', path, handler);
  }

  public post(path: string, handler: RouteHandler): this {
    return this.register('POST', path, handler);
  }

  public put(path: string, handler: RouteHandler): this {
    return this.register('PUT', path, handler);
  }

  public delete(path: string, handler: RouteHandler): this {
    return this.register('DELETE', path, handler);
  }

  public register(method: string, path: string, handler: RouteHandler): this {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPath}$`);
    this.routes.push({
      method: method.toUpperCase(),
      path,
      regex,
      paramNames,
      handler,
    });
    return this;
  }

  public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // 1. Inject Financial-Grade HTTP Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none';");

    if (handleCors(req, res)) {
      return;
    }

    const fullUrl = req.url || '/';
    const parts = fullUrl.split('?');
    const pathname: string = parts[0] || '/';
    const queryString: string | undefined = parts[1];
    const method = (req.method || 'GET').toUpperCase();

    // 2. Sliding-Window Rate Limiter for Authentication & Sensitive Endpoints
    if (pathname.startsWith('/api/v1/auth/login') || pathname.includes('/set-pin')) {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
      if (!this.checkRateLimit(clientIp, 10, 60000)) {
        sendJson(res, 429, {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Terlalu banyak percobaan autentikasi. Silakan tunggu 1 menit.',
          },
        });
        return;
      }
    }

    const query: Record<string, string> = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((val, key) => {
        query[key] = val;
      });
    }

    for (const route of this.routes) {
      if (route.method === method) {
        const match = pathname.match(route.regex);
        if (match) {
          const params: Record<string, string> = {};
          route.paramNames.forEach((name, idx) => {
            params[name] = decodeURIComponent(match[idx + 1] || '');
          });

          try {
            await route.handler(req, res, params, query);
            return;
          } catch (err: any) {
            sendJson(res, 500, {
              success: false,
              error: {
                message: err.message || 'Internal server error',
                code: 'INTERNAL_ERROR',
              },
            });
            return;
          }
        }
      }
    }

    sendJson(res, 404, {
      success: false,
      error: { message: `Endpoint not found: ${method} ${pathname}`, code: 'NOT_FOUND' },
    });
  }

  private rateLimitMap = new Map<string, { count: number; resetAt: number }>();

  private checkRateLimit(ip: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
      this.rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count += 1;
    return true;
  }
}


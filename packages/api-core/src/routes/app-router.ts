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
    if (handleCors(req, res)) {
      return;
    }

    const fullUrl = req.url || '/';
    const parts = fullUrl.split('?');
    const pathname: string = parts[0] || '/';
    const queryString: string | undefined = parts[1];
    const method = (req.method || 'GET').toUpperCase();

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
}

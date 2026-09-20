import http from 'http';

export const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/(?:[a-z0-9-]+\.)?sidaya\.test(?::\d+)?$/,
  /^https?:\/\/(?:[a-z0-9-]+\.)?sidaya\.my\.id(?::\d+)?$/,
  /^https?:\/\/(?:[a-z0-9-]+\.)?sidaya\.biz\.id(?::\d+)?$/,
  /^https?:\/\/(?:[a-z0-9-]+\.)?localhost(?::\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
];

export function getCorsHeaders(req?: http.IncomingMessage): Record<string, string> {
  const origin = req?.headers['origin'] as string | undefined;
  let allowedOrigin = '*';

  if (origin) {
    const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
    if (isAllowed) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Tenant-ID, Idempotency-Key, X-Operator-Role, X-Operator-Email, X-Operator-Id, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Tenant-ID, Idempotency-Key, X-Operator-Role, X-Operator-Email, X-Operator-Id, X-Requested-With',
};

export function handleCors(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  if (req.method === 'OPTIONS') {
    const headers = getCorsHeaders(req);
    res.writeHead(204, headers);
    res.end();
    return true;
  }
  return false;
}

export function sendJson(res: http.ServerResponse, statusCode: number, data: unknown, req?: http.IncomingMessage): void {
  const headers = getCorsHeaders(req);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(JSON.stringify(data));
}


import http from 'http';

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, Idempotency-Key, X-Operator-Role, X-Operator-Email, X-Operator-Id',
};

export function handleCors(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return true;
  }
  return false;
}

export function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(data));
}

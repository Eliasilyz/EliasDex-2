import { NextRequest } from 'next/server';
import { handleAnikotoProxy } from '@/lib/server/apiHandlers';
import { jsonWithHeaders } from '@/lib/server/response';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const rawPath = path.join('/');
  const search = request.nextUrl.search;

  try {
    const result = await handleAnikotoProxy(rawPath, search);
    return jsonWithHeaders(result.body, result.headers);
  } catch (err: unknown) {
    console.warn(`[Anikoto Proxy Error] ${rawPath}:`, err instanceof Error ? err.message : err);
    return jsonWithHeaders(null);
  }
}

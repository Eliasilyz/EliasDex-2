import { NextRequest } from 'next/server';
import { handleJikanProxy } from '@/lib/server/apiHandlers';
import { jsonWithHeaders } from '@/lib/server/response';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const rawPath = path.join('/');
  const search = request.nextUrl.search;
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const result = await handleJikanProxy(rawPath, queryParams, search);

    if (result.isFallback) {
      const body = result.body as { data?: unknown } | null;
      if (!body || body.data === null || body.data === undefined) {
        return jsonWithHeaders(
          { error: 'Jikan service unavailable and no fallback available' },
          result.headers,
          { status: 502 },
        );
      }
    }

    return jsonWithHeaders(result.body, result.headers);
  } catch {
    return jsonWithHeaders({ error: 'Jikan proxy failure' }, {}, { status: 502 });
  }
}

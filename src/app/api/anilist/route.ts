import { NextRequest, NextResponse } from 'next/server';
import { handleAnilistProxy } from '@/lib/server/apiHandlers';
import { jsonWithHeaders } from '@/lib/server/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { query, variables } = body as { query?: string; variables?: unknown };

  if (!query) {
    return NextResponse.json({ error: 'GraphQL query parameter is required' }, { status: 400 });
  }

  try {
    const result = await handleAnilistProxy(query, variables);
    return jsonWithHeaders(result.body, result.headers);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.warn('[AniList Proxy Error]:', error.message || err);
    return NextResponse.json(
      { errors: [{ message: error.message || 'AniList upstream query failure' }] },
      { status: error.status || 500 },
    );
  }
}

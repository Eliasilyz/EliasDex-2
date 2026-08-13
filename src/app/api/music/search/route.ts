import { NextRequest } from 'next/server';
import { handleMusicSearch } from '@/lib/server/apiHandlers';
import { jsonWithHeaders } from '@/lib/server/response';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') || '').trim();

  if (!query) {
    return jsonWithHeaders({ error: 'Query parameter q is required' }, {}, { status: 400 });
  }

  const result = await handleMusicSearch(query);
  return jsonWithHeaders(result.body, result.headers);
}

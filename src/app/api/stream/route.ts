import { NextRequest, NextResponse } from 'next/server';
import { buildStreamUrl, StreamSource } from '@/lib/stream';

export async function GET(request: NextRequest) {
  try {
    const source = (request.nextUrl.searchParams.get('source') as StreamSource) || 'mal';
    const id = request.nextUrl.searchParams.get('id') || request.nextUrl.searchParams.get('malId');
    const ep = parseInt(request.nextUrl.searchParams.get('ep') || '1', 10) || 1;
    const lang = (request.nextUrl.searchParams.get('lang') as 'sub' | 'dub') || 'sub';

    if (!id) {
      return NextResponse.json({ error: 'Missing anime ID' }, { status: 400 });
    }

    const embedUrl = buildStreamUrl(source, String(id), ep, lang);
    return NextResponse.json({ embedUrl, source, id, ep, lang });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve stream URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

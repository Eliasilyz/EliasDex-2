import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return new NextResponse('dh=042f2da96353e68d14d04b794be17fc8a764c3a4', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

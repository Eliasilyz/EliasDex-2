import { NextResponse } from 'next/server';

export function jsonWithHeaders(
  body: unknown,
  headers: Record<string, string> = {},
  init?: ResponseInit,
) {
  const response = NextResponse.json(body, init);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

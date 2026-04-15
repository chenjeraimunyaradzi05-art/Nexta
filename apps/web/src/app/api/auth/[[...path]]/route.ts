import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_ORIGIN } from '@/lib/apiBase';

const STRIP_HEADERS = [
  'host',
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
  'content-length',
  'connection',
];

async function proxy(req: NextRequest) {
  if (!BACKEND_API_ORIGIN) {
    return NextResponse.json({ error: 'Backend API origin is not configured.' }, { status: 500 });
  }

  const url = new URL(req.url);
  const suffix = url.pathname.replace(/^\/api\/auth(?:\/|$)/, '');
  const normalizedSuffix = suffix ? `/${suffix}` : '';
  const target = `${BACKEND_API_ORIGIN}/auth${normalizedSuffix}${url.search}`;

  const headers = new Headers(req.headers);
  for (const header of STRIP_HEADERS) {
    headers.delete(header);
  }

  const requestBody = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const response = await fetch(target, {
    method: req.method,
    headers,
    ...(requestBody !== undefined ? { body: requestBody } : {}),
    redirect: 'manual',
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete('content-length');

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export async function PUT(req: NextRequest) {
  return proxy(req);
}

export async function PATCH(req: NextRequest) {
  return proxy(req);
}

export async function DELETE(req: NextRequest) {
  return proxy(req);
}

export async function OPTIONS(req: NextRequest) {
  return proxy(req);
}

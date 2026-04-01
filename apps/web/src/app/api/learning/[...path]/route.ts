import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_ORIGIN } from '@/lib/apiBase';

// Headers that should never be forwarded to the backend
const STRIP_HEADERS = ['host', 'cookie', 'set-cookie', 'x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'];

async function proxy(req: NextRequest) {
  if (!BACKEND_API_ORIGIN) {
    return NextResponse.json({ error: 'Backend API origin is not configured.' }, { status: 500 });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/learning/, '');
  const target = `${BACKEND_API_ORIGIN}/learning${path}${url.search}`;

  const headers = new Headers(req.headers);
  for (const h of STRIP_HEADERS) {
    headers.delete(h);
  }

  const requestBody = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const init = {
    method: req.method,
    headers,
    ...(requestBody !== undefined ? { body: requestBody } : {}),
  };

  const response = await fetch(target, init);
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers: response.headers,
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

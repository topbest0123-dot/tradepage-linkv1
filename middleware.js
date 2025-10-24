// middleware.js (Next.js root)
import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = new URL(req.url);
  // Force "www." (change to the one you want to keep)
  if (url.hostname === 'tradepage.link') {
    url.hostname = 'www.tradepage.link';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};

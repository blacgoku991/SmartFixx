import {NextResponse,type NextRequest} from 'next/server';
export function proxy(request:NextRequest){const nonce=Buffer.from(crypto.randomUUID()).toString('base64'),h=new Headers(request.headers);
 for(const key of [...h.keys()])if(key.startsWith('oai-'))h.delete(key);
 const policy=`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
 h.set('x-nonce',nonce);h.set('Content-Security-Policy',policy);const response=NextResponse.next({request:{headers:h}});response.headers.set('Content-Security-Policy',policy);response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy',request.nextUrl.pathname.startsWith('/email')?'no-referrer':'strict-origin-when-cross-origin');response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 if(request.nextUrl.pathname.startsWith('/admin')||request.nextUrl.pathname.startsWith('/api/')){response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive')}
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|webp|svg|jpg|jpeg|woff2|zip|sh)$).*)']};

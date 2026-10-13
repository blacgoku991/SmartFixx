/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    const responseHeaders = new Headers(response.headers);
    const emailPath = url.pathname.startsWith("/email/") || url.pathname.startsWith("/api/email/") || url.pathname === "/api/relay";
    const protectedPath = emailPath || url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/admin/");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("Referrer-Policy", emailPath ? "no-referrer" : "strict-origin-when-cross-origin");
    responseHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    if (url.protocol === "https:") responseHeaders.set("Strict-Transport-Security", "max-age=31536000");
    if (protectedPath) {
      responseHeaders.set("Cache-Control", "private, no-store, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    const html=responseHeaders.get("content-type")?.includes("text/html");
    const nonce=crypto.randomUUID().replaceAll("-", "");
    responseHeaders.set("Content-Security-Policy", `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com`);
    responseHeaders.delete("X-Powered-By");
    if (html) { responseHeaders.delete("Content-Length"); responseHeaders.delete("ETag"); }
    const secured = new Response(response.body,{status:response.status,statusText:response.statusText,headers:responseHeaders});
    return html ? new HTMLRewriter().on("script", {element(el){el.setAttribute("nonce",nonce);}}).transform(secured) : secured;
  },
};

export default worker;

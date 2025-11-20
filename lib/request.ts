import { NextRequest } from "next/server";

function getBaseUrlFromRequest(request: NextRequest) {
  // Check for forwarded host (set by ngrok and other proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const host = forwardedHost || request.headers.get("host");

  // Check for forwarded protocol
  const forwardedProto = request.headers.get("x-forwarded-proto");
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const protocol = forwardedProto || "https";

  if (!host) {
    throw new Error("Host header is missing");
  }

  return `${protocol}://${host}`;
}

function getIpAddressFromRequest(request: NextRequest) {
  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    // Cloudflare
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
  /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
}

export { getBaseUrlFromRequest, getIpAddressFromRequest };

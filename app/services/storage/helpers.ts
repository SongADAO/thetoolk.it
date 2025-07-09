function hasExpired(expiry: string | null, bufferSeconds: number) {
  if (!expiry) {
    return false;
  }

  const expiryDate = new Date(expiry);

  // Check if token is expired or about to expire (5 minutes buffer)
  const now = new Date();

  // Convert seconds to milliseconds
  const bufferMilliseconds = bufferSeconds * 1000;

  return now.getTime() > expiryDate.getTime() - bufferMilliseconds;
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...Array.from(array)))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/[=]/gu, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/[=]/gu, "");
}

export { generateCodeChallenge, generateCodeVerifier, hasExpired };

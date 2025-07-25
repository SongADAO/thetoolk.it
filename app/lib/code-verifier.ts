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

export { generateCodeChallenge, generateCodeVerifier };

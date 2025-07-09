/**
 * Minimal SHA-256 hash function for browser and Node.js 18+
 */
async function sha256Hash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }

  // eslint-disable-next-line no-bitwise
  return (hash >>> 0).toString(16);
}

function objectIdHash(credentials: object): string {
  const entries = Object.entries(credentials).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const str = entries.map(([key, value]) => `${key}:${String(value)}`).join("");

  return djb2Hash(str);
}

export { djb2Hash, objectIdHash, sha256Hash };

import { NextResponse } from "next/server";

import { getKeyset } from "@/services/post/bluesky/oauth-client-node";

export async function GET() {
  try {
    // Use the same keyset creation logic as the OAuth client
    const keyset = await getKeyset();

    const keys = [];

    for (const joseKey of keyset) {
      try {
        if (!joseKey.publicJwk) {
          throw new Error("Could not extract public key from JoseKey");
        }

        // Add required JWKS fields
        const jwk = {
          ...joseKey.publicJwk,
          alg: "ES256K",
          use: "sig",
          // kid should already be set from JoseKey constructor
        };

        // Ensure we don't accidentally include private key material
        delete jwk.d;

        keys.push(jwk);
      } catch (err: unknown) {
        console.error(`Error processing JoseKey:`, err);
      }
    }

    if (keys.length === 0) {
      throw new Error("No valid keys could be processed");
    }

    const jwks = {
      keys,
    };

    return NextResponse.json(jwks, {
      headers: {
        // Allow CORS for JWKS
        "Access-Control-Allow-Origin": "*",
        // Cache for 1 hour
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error("JWKS generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 },
    );
  }
}

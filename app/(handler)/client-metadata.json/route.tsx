import { NextResponse } from "next/server";

export function GET() {
  const metadata = {
    application_type: "web",
    client_id: `${process.env.NEXT_PUBLIC_BASE_URL}/client-metadata.json`,
    client_name: "The Toolk.it",
    client_uri: process.env.NEXT_PUBLIC_BASE_URL,
    dpop_bound_access_tokens: true,
    grant_types: ["authorization_code", "refresh_token"],
    logo_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    redirect_uris: [`${process.env.NEXT_PUBLIC_BASE_URL}/oauth/callback`],
    response_types: ["code"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
  };

  return NextResponse.json(metadata);
}

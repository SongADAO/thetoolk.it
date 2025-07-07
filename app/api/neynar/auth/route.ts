import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest } from "next/server";

// Generate a new signer for Sign-in-with-Neynar
async function generateSigner(client: NeynarAPIClient) {
  try {
    // Create a new signer using v2 method
    const signer = await client.createSigner();

    return Response.json({
      public_key: signer.public_key,
      signer_approval_url: signer.signer_approval_url,
      signer_uuid: signer.signer_uuid,
      status: signer.status,
      success: true,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error generating signer:", err);
    throw new Error(`Failed to generate signer: ${errMessage}`);
  }
}

// Verify signer status
async function verifySigner(
  client: NeynarAPIClient,
  { signerUuid }: { signerUuid: string },
) {
  try {
    if (!signerUuid) {
      throw new Error("signer_uuid is required");
    }

    // Look up signer using v2 method
    const signer = await client.lookupSigner({ signerUuid });

    return Response.json({
      fid: signer.fid,
      public_key: signer.public_key,
      signer_uuid: signer.signer_uuid,
      status: signer.status,
      success: true,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error verifying signer:", err);
    throw new Error(`Failed to verify signer: ${errMessage}`);
  }
}

// Get user information by signer UUID
async function getUserBySigner(
  client: NeynarAPIClient,
  { signerUuid }: { signerUuid: string },
) {
  try {
    if (!signerUuid) {
      throw new Error("signer_uuid is required");
    }

    // First get the signer to get the FID
    const signer = await client.lookupSigner({ signerUuid });

    if (!signer.fid) {
      throw new Error("Signer not approved or no FID associated");
    }

    // Then get user information using v2 method
    const usersResponse = await client.fetchBulkUsers({ fids: [signer.fid] });

    if (usersResponse.users.length === 0) {
      throw new Error("User not found");
    }

    const userData = usersResponse.users[0];

    return Response.json({
      signer: {
        public_key: signer.public_key,
        signer_uuid: signer.signer_uuid,
        status: signer.status,
      },
      success: true,
      user: {
        bio: userData.profile.bio.text,
        display_name: userData.display_name,
        fid: userData.fid,
        follower_count: userData.follower_count,
        following_count: userData.following_count,
        pfp_url: userData.pfp_url,
        username: userData.username,
        verified_addresses: userData.verified_addresses,
      },
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting user by signer:", err);
    throw new Error(`Failed to get user: ${errMessage}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...payload } = await request.json();

    // Initialize client with v2 syntax
    const config = new Configuration({
      apiKey: process.env.NEYNAR_API_KEY ?? "",
    });

    const client = new NeynarAPIClient(config);

    switch (action) {
      case "generate_signer":
        return await generateSigner(client);

      case "verify_signer":
        return await verifySigner(client, payload);

      case "get_user_by_signer":
        return await getUserBySigner(client, payload);

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("Sign-in-with-Neynar API error:", err);
    const errMessage =
      err instanceof Error ? err.message : "Authentication failed";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}

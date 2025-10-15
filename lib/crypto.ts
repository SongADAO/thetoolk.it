/* eslint-disable import/no-nodejs-modules */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

/**
 * Encryption utility for sensitive service authorization data
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * Derives a key from the master encryption key and salt
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, KEY_LENGTH);
}

/**
 * Encrypts data using AES-256-GCM
 * @param data - The data to encrypt (will be JSON stringified)
 * @param masterKey - The master encryption key from environment variable
 * @returns Encryption result with encrypted data, IV, tag, and salt
 */
function encryptServiceAuthorization(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  masterKey: string,
): EncryptionResult {
  if (!masterKey) {
    throw new Error("Encryption key is required");
  }

  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive encryption key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    tag: tag.toString("base64"),
  };
}

/**
 * Decrypts data encrypted with encryptServiceAuthorization
 * @param encryptionResult - The encryption result containing encrypted data, IV, tag, and salt
 * @param masterKey - The master encryption key from environment variable
 * @returns The decrypted data
 */
function decryptServiceAuthorization(
  encryptionResult: EncryptionResult,
  masterKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (!masterKey) {
    throw new Error("Encryption key is required");
  }

  try {
    // Convert from base64
    const iv = Buffer.from(encryptionResult.iv, "base64");
    const tag = Buffer.from(encryptionResult.tag, "base64");
    const salt = Buffer.from(encryptionResult.salt, "base64");

    // Derive the same key using the stored salt
    const key = deriveKey(masterKey, salt);

    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(
      encryptionResult.encrypted,
      "base64",
      "utf8",
    );
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err: unknown) {
    throw new Error(
      "Failed to decrypt service authorization: Invalid data or key",
      {
        cause: err,
      },
    );
  }
}

/**
 * Get the master encryption key from environment variables
 * This should be a securely generated random string stored in your environment
 */
function getEncryptionKey(): string {
  const key = process.env.SERVICE_AUTHORIZATION_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "SERVICE_AUTHORIZATION_ENCRYPTION_KEY environment variable is not set",
    );
  }

  // Validate key length (should be at least 32 characters for good security)
  if (key.length < 32) {
    throw new Error(
      "SERVICE_AUTHORIZATION_ENCRYPTION_KEY must be at least 32 characters long",
    );
  }

  return key;
}

export {
  decryptServiceAuthorization,
  encryptServiceAuthorization,
  getEncryptionKey,
};

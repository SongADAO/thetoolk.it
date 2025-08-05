#!/usr/bin/env node
// scripts/generate-oauth-keys.mjs
// Run this script to generate the private keys for your OAuth setup

import { generateKeyPair } from 'crypto';
import { promisify } from 'util';

const generateKeyPairAsync = promisify(generateKeyPair);

async function generateOAuthKeys() {
  console.log('Generating OAuth private keys...\n');

  for (let i = 1; i <= 3; i++) {
    try {
      const { privateKey } = await generateKeyPairAsync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      console.log(`ATPROTO_OAUTH_PRIVATE_KEY_${i}="${privateKey.replace(/\n/g, '\\n')}"`);
      console.log('');
    } catch (error) {
      console.error(`Error generating key ${i}:`, error);
    }
  }

  console.log('Copy the above environment variables to your .env.local file');
  console.log('Make sure to keep these keys secure and never commit them to version control!');
}

// Alternative: Generate ES256 keys (more commonly supported)
async function generateES256Keys() {
  console.log('Generating ES256 OAuth private keys...\n');

  for (let i = 1; i <= 3; i++) {
    try {
      const { privateKey } = await generateKeyPairAsync('ec', {
        namedCurve: 'prime256v1', // P-256 curve for ES256
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      console.log(`ATPROTO_OAUTH_PRIVATE_KEY_${i}="${privateKey.replace(/\n/g, '\\n')}"`);
      console.log('');
    } catch (error) {
      console.error(`Error generating ES256 key ${i}:`, error);
    }
  }
}

// Run the main function
try {
  await generateOAuthKeys();

  // Uncomment to use ES256 instead:
  // await generateES256Keys();
} catch (error) {
  console.error('Failed to generate keys:', error);
  process.exit(1);
}

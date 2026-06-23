import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Returns the 32-byte encryption key derived from the environment variable.
 * Falls back to a SHA-256 hash of the JWT_SECRET if no dedicated key is set.
 */
function getEncryptionKey(): Buffer {
  const raw =
    process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!raw) {
    throw new Error(
      'Neither CREDENTIAL_ENCRYPTION_KEY nor JWT_SECRET is set. Cannot encrypt credentials.',
    );
  }
  // Ensure exactly 32 bytes regardless of input length
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a combined string: `iv_hex:authTag_hex:ciphertext_hex`
 */
export function encryptCredential(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a credential string produced by `encryptCredential`.
 * Expects the format: `iv_hex:authTag_hex:ciphertext_hex`
 */
export function decryptCredential(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted credential format');
  }

  const [ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypts a value only if it is not already encrypted.
 * Useful for idempotent upsert flows.
 */
export function encryptIfPlaintext(value: string | null | undefined): string | null {
  if (!value) return null;
  // Already encrypted values contain exactly two colons (iv:tag:cipher)
  if (value.split(':').length === 3 && /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value)) {
    return value;
  }
  return encryptCredential(value);
}

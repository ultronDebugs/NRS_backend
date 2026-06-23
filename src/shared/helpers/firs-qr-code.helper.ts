import * as crypto from "crypto";
import { InternalServerErrorException } from "@nestjs/common";

/**
 * Decode Base64 → PEM public key
 */
function getPublicKeyPem(publicKeyBase64?: string): string {
  const base64Key = publicKeyBase64 || process.env.FIRS_PUBLIC_KEY_BASE64;
  if (!base64Key) {
    throw new InternalServerErrorException("Missing FIRS public key for encryption");
  }
  return Buffer.from(base64Key, "base64").toString("utf-8");
}

/**
 * Encrypt IRN + Certificate using RSA public key
 */
function encryptPayload(payloadStr: string, publicKeyBase64?: string): string {
  const publicKeyPem = getPublicKeyPem(publicKeyBase64);
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(payloadStr),
  );
  return encryptedBuffer.toString("base64");
}

/**
 * Generate QR Code encrypted payload (Base64)
 * @param irn - The Invoice Reference Number
 * @param publicKeyBase64 - The business's RSA public key (base64)
 * @param certificateBase64 - The business's digital certificate (base64)
 * @returns The encrypted base64 string
 */
export function generateFirsQrCode(irn: string, publicKeyBase64?: string, certificateBase64?: string): string {
  const certificate = certificateBase64 || process.env.FIRS_CERTIFICATE_BASE64;
  if (!certificate) {
    throw new InternalServerErrorException("Missing FIRS certificate for QR generation");
  }
  // The FIRS spec says "Unix timestamp" but the official npm package firs-einvoicing generates a time string.
  // We must emulate the exact format from the firs-einvoicing package to pass MBS360 verification: HHmmssSSS
  const now = new Date();
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '') + String(now.getMilliseconds()).padStart(3, '0');
  const irnWithTimestamp = irn.includes('.') ? irn : `${irn}.${timePart}`;
  const payloadStr = JSON.stringify({ irn: irnWithTimestamp, certificate });
  const encryptedBase64 = encryptPayload(payloadStr, publicKeyBase64);
  return encryptedBase64;
}

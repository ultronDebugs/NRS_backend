import * as crypto from "crypto";

/**
 * Parameters for generating FIRS QR code with optional keys.
 */
export interface GenerateQrCodeParams {
  irn: string;
  publicKeyBase64?: string;
  certificateBase64?: string;
}

/**
 * Resolves public key PEM from provided base64 or environment.
 * @param publicKeyBase64 - Optional base64-encoded public key
 * @returns PEM-formatted public key
 */
function resolvePublicKeyPem(publicKeyBase64?: string): string {
  const base64Key = publicKeyBase64 ?? process.env.FIRS_PUBLIC_KEY_BASE64;
  if (!base64Key) {
    throw new Error(
      "Missing FIRS_PUBLIC_KEY_BASE64: provide in payload, user settings, or env",
    );
  }
  return Buffer.from(base64Key, "base64").toString("utf-8");
}

/**
 * Resolves certificate from provided base64 or environment.
 * @param certificateBase64 - Optional base64-encoded certificate
 * @returns Base64 certificate string
 */
function resolveCertificate(certificateBase64?: string): string {
  const certificate = certificateBase64 ?? process.env.FIRS_CERTIFICATE_BASE64;
  if (!certificate) {
    throw new Error(
      "Missing FIRS_CERTIFICATE_BASE64: provide in payload, user settings, or env",
    );
  }
  return certificate;
}

/**
 * Encrypts payload using RSA public key.
 * @param payload - Object to encrypt
 * @param publicKeyPem - PEM-formatted public key
 * @returns Base64-encoded encrypted string
 */
function encryptPayload(payload: object, publicKeyPem: string): string {
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(JSON.stringify(payload)),
  );
  return encryptedBuffer.toString("base64");
}

/**
 * Generates FIRS QR code encrypted payload (Base64).
 * Same logic as invoice module but accepts optional public key and certificate.
 * @param params - IRN and optional keys
 * @returns The encrypted base64 string
 */
export function generateFirsQrCodeWithKeys(
  params: GenerateQrCodeParams,
): string {
  const certificate = resolveCertificate(params.certificateBase64);
  const publicKeyPem = resolvePublicKeyPem(params.publicKeyBase64);
  const payload = {
    irn: params.irn,
    certificate,
  };
  return encryptPayload(payload, publicKeyPem);
}

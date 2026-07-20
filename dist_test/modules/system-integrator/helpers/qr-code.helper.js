"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFirsQrCodeWithKeys = generateFirsQrCodeWithKeys;
const crypto = require("crypto");
function resolvePublicKeyPem(publicKeyBase64) {
    const base64Key = publicKeyBase64 ?? process.env.FIRS_PUBLIC_KEY_BASE64;
    if (!base64Key) {
        throw new Error("Missing FIRS_PUBLIC_KEY_BASE64: provide in payload, user settings, or env");
    }
    return Buffer.from(base64Key, "base64").toString("utf-8");
}
function resolveCertificate(certificateBase64) {
    const certificate = certificateBase64 ?? process.env.FIRS_CERTIFICATE_BASE64;
    if (!certificate) {
        throw new Error("Missing FIRS_CERTIFICATE_BASE64: provide in payload, user settings, or env");
    }
    return certificate;
}
function encryptPayload(payload, publicKeyPem) {
    const encryptedBuffer = crypto.publicEncrypt({
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
    }, Buffer.from(JSON.stringify(payload)));
    return encryptedBuffer.toString("base64");
}
function generateFirsQrCodeWithKeys(params) {
    const certificate = resolveCertificate(params.certificateBase64);
    const publicKeyPem = resolvePublicKeyPem(params.publicKeyBase64);
    const payload = {
        irn: params.irn,
        certificate,
    };
    return encryptPayload(payload, publicKeyPem);
}
//# sourceMappingURL=qr-code.helper.js.map
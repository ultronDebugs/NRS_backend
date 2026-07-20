"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFirsQrCode = generateFirsQrCode;
const crypto = require("crypto");
const common_1 = require("@nestjs/common");
function getPublicKeyPem(publicKeyBase64) {
    const base64Key = publicKeyBase64 || process.env.FIRS_PUBLIC_KEY_BASE64;
    if (!base64Key) {
        throw new common_1.InternalServerErrorException("Missing FIRS public key for encryption");
    }
    return Buffer.from(base64Key, "base64").toString("utf-8");
}
function encryptPayload(payloadStr, publicKeyBase64) {
    const publicKeyPem = getPublicKeyPem(publicKeyBase64);
    const encryptedBuffer = crypto.publicEncrypt({
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
    }, Buffer.from(payloadStr));
    return encryptedBuffer.toString("base64");
}
function generateFirsQrCode(irn, publicKeyBase64, certificateBase64) {
    const certificate = certificateBase64 || process.env.FIRS_CERTIFICATE_BASE64;
    if (!certificate) {
        throw new common_1.InternalServerErrorException("Missing FIRS certificate for QR generation");
    }
    const now = new Date();
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '') + String(now.getMilliseconds()).padStart(3, '0');
    const irnWithTimestamp = irn.includes('.') ? irn : `${irn}.${timePart}`;
    const payloadStr = JSON.stringify({ irn: irnWithTimestamp, certificate });
    const encryptedBase64 = encryptPayload(payloadStr, publicKeyBase64);
    return encryptedBase64;
}
//# sourceMappingURL=firs-qr-code.helper.js.map
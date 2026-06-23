"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptCredential = encryptCredential;
exports.decryptCredential = decryptCredential;
exports.encryptIfPlaintext = encryptIfPlaintext;
const crypto = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
function getEncryptionKey() {
    const raw = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!raw) {
        throw new Error('Neither CREDENTIAL_ENCRYPTION_KEY nor JWT_SECRET is set. Cannot encrypt credentials.');
    }
    return crypto.createHash('sha256').update(raw).digest();
}
function encryptCredential(plaintext) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
function decryptCredential(encrypted) {
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
function encryptIfPlaintext(value) {
    if (!value)
        return null;
    if (value.split(':').length === 3 && /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value)) {
        return value;
    }
    return encryptCredential(value);
}
//# sourceMappingURL=crypto.util.js.map
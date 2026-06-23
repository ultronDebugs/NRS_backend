/**
 * Generate a QR code from the actual encryptedBase64, exactly how firs-einvoicing does,
 * so we can rule out third-party QR generator issues.
 * 
 * This also tries the OFFICIAL firs-einvoicing library directly for comparison.
 */
import crypto from 'crypto';

const PUBLIC_KEY_BASE64 = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFyU0xpdDRtb1RMbFdjd1A4eEp6RQp3ZTdkRHExdC9kMi9zcXdQTlNVandablFPbklabVh4TXY4QUQxemMxdUErZ3VCc2tpUGdoSXd6ekxWYXJoNk1KCndEdVUxSC95V2FPZE1PTnZOQy9OWERybXB5cE5WUDZyQnV3LzVjSERMdEtoZlJ0YkdFa1JSVVF4MVAxUUJ6REsKVVRpaTRJOXJld29zcVQ4V1dBOE8zRVd5ZHJ5TEg1K3JpVmRUNVBPeU1jcU95YUR2bGRqWG9ZdnBSTHlkcmtDQQpkUWpMdkw0bG00TVNxS05WdGVJR0Y4ZWk4M3Juck5wR3hKTVVGYVMwekt5TzBJZlY0alBCK3ZXN3I1TXdzTjRvCkRnWVR2ME85Q050N3JoNlEvYi9XR3Ewakl3WHJ3c3JIQXE4TXNyUVlGV0JIOHpmejMwOHRWMTlRM1hPTnEyWEMKMHdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
const CERTIFICATE = "eXkybmdKN1dpZFlNTkx2WFBGZzFCUzJXU29TcmRJYWM5UDNRR1RNQXVjaz0=";
const IRN = "INV001-0AB18243-20260517";

// Replicate exactly what generateFirsQrCode does
const publicKeyPem = Buffer.from(PUBLIC_KEY_BASE64, 'base64').toString('utf-8');
const now = new Date();
const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '') + now.getMilliseconds();
const irnWithTimestamp = `${IRN}.${timePart}`;
const payload = JSON.stringify({ irn: irnWithTimestamp, certificate: CERTIFICATE });

const encrypted = crypto.publicEncrypt(
  { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
  Buffer.from(payload)
);
const encryptedBase64 = encrypted.toString('base64');

console.log("═══════════════════════════════════════════════════════════");
console.log("  QR Code Base64 Output");
console.log("═══════════════════════════════════════════════════════════\n");
console.log("Encrypted Base64 (copy this entire string into QR generator):");
console.log(encryptedBase64);
console.log("\nLength:", encryptedBase64.length, "chars");
console.log("Contains newlines?", encryptedBase64.includes('\n') ? "YES ⚠️" : "NO ✅");
console.log("Contains spaces?", encryptedBase64.includes(' ') ? "YES ⚠️" : "NO ✅");
console.log("Contains +?", encryptedBase64.includes('+') ? "YES (may cause issues with URL-safe QR)" : "NO");
console.log("Contains /?", encryptedBase64.includes('/') ? "YES (may cause issues with URL-safe QR)" : "NO");
console.log();

// Now use the official firs-einvoicing library
console.log("═══════════════════════════════════════════════════════════");
console.log("  Official firs-einvoicing library output");
console.log("═══════════════════════════════════════════════════════════\n");

try {
  const { generateQRCode } = await import('firs-einvoicing/src/generateQRCode.js');
  
  const result = await generateQRCode({
    irn: IRN,
    certificate: CERTIFICATE,
    publicKey: PUBLIC_KEY_BASE64,
    size: 200
  });
  
  console.log("Official library Base64:");
  console.log(result.encryptedBase64);
  console.log("\nLength:", result.encryptedBase64.length, "chars");
  console.log("Contains newlines?", result.encryptedBase64.includes('\n') ? "YES ⚠️" : "NO ✅");
  console.log("Contains spaces?", result.encryptedBase64.includes(' ') ? "YES ⚠️" : "NO ✅");
  
  console.log("\n── Comparison ──");
  console.log("Same length?", encryptedBase64.length === result.encryptedBase64.length ? "✅" : "❌");
  console.log("(Both will have different ciphertext due to random RSA padding, that's normal)");
  
  // The official library also generates a QR image - save it
  if (result.qrCodeBuffer) {
    const { writeFile } = await import('fs/promises');
    await writeFile('/Users/user/Downloads/Genius-ExcelBackendSI/firs-official-qr.png', result.qrCodeBuffer);
    console.log("\n✅ Official library QR code saved to: firs-official-qr.png");
    console.log("   Scan THIS with MBS360 to verify the official library works.");
  }
  
} catch (err) {
  console.log("❌ Failed to use official library:", err.message);
  console.log("   Trying to install qrcode package...");
}

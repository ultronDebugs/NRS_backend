const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const biz = await prisma.business.findUnique({
    where: { id: 'ac30649a-8243-4fc8-b6a5-654606b8e734' },
    select: {
      id: true,
      name: true,
      tin: true,
      firsPublicKeyBase64: true,
      firsCertificateBase64: true,
      firsApiKey: true,
      firsApiSecret: true,
    }
  });
  
  if (!biz) {
    console.log("❌ Business not found!");
    return;
  }
  
  console.log("Business:", biz.name, "(", biz.tin, ")");
  console.log("firsPublicKeyBase64:", biz.firsPublicKeyBase64 ? biz.firsPublicKeyBase64.substring(0, 40) + "..." : "NULL");
  console.log("firsCertificateBase64:", biz.firsCertificateBase64 || "NULL");
  console.log("firsApiKey:", biz.firsApiKey ? biz.firsApiKey.substring(0, 20) + "..." : "NULL");
  console.log("firsApiSecret:", biz.firsApiSecret ? biz.firsApiSecret.substring(0, 20) + "..." : "NULL");
  
  // Compare with env
  const envPubKey = process.env.FIRS_PUBLIC_KEY_BASE64;
  const envCert = process.env.FIRS_CERTIFICATE_BASE64;
  
  console.log("\n── Comparison with .env ──");
  console.log("DB pubkey matches env?", biz.firsPublicKeyBase64 === envPubKey ? "✅ YES" : biz.firsPublicKeyBase64 ? "❌ NO - DIFFERENT" : "⚠️  DB is NULL (will use env fallback)");
  console.log("DB certificate matches env?", biz.firsCertificateBase64 === envCert ? "✅ YES" : biz.firsCertificateBase64 ? "❌ NO - DIFFERENT" : "⚠️  DB is NULL (will use env fallback)");
  
  // Also check what the actual flow does
  console.log("\n── Values that getInvoiceById will use ──");
  const usedPubKey = biz.firsPublicKeyBase64 ?? envPubKey;
  const usedCert = biz.firsCertificateBase64 ?? envCert;
  console.log("Public key (first 40):", usedPubKey ? usedPubKey.substring(0, 40) + "..." : "NONE!");
  console.log("Certificate:", usedCert || "NONE!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

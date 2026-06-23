import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@genius-excel.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThis123!';
  const adminBusinessName = process.env.ADMIN_BUSINESS_NAME || 'Genius-Excel Admin';

  console.log(`Seeding admin user: ${adminEmail}...`);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      businessName: adminBusinessName,
      role: 'ADMIN',
      isEmailVerified: true,
      isProfileComplete: true,
    },
  });

  console.log('Seeding completed successfully.');
  console.log(`Admin user created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

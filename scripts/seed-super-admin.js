const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.com";
  const password = "admin123!";

  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Default Agency",
        slug: "default",
        subdomain: "default",
        brandName: "Study Abroad Platform",
      },
    });
    console.log("Created default tenant");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      firstName: "Super",
      lastName: "Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
    },
  });

  console.log("Super admin created:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     SUPER_ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

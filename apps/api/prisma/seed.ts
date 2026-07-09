import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@aidistudio.dev";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Demo user already exists: ${email}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName: "Demo User",
      passwordHash: await hashPassword("password123"),
      emailVerified: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Demo Project",
      ownerId: user.id,
      members: { create: { userId: user.id, name: user.displayName, email: user.email, role: "owner" } },
      billing: { create: {} },
    },
  });

  console.log(`Seeded demo user ${email} / password123 with project ${project.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

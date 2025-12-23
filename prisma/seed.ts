import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Usage: npm run make-admin -- you@example.com
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}
prisma.user
  .update({ where: { email }, data: { role: "admin" } })
  .then((u) => console.log(`${u.email} is now an admin.`))
  .catch((e) => { console.error("No user with that email. Sign up first."); console.error(e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());

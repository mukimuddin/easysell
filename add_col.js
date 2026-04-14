const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE employee_details ADD COLUMN contract_target INT DEFAULT 0');
    console.log('Done adding contract_target');
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log('Column already exists');
    } else {
      console.error(e);
    }
  }
}
main().finally(() => prisma.$disconnect());

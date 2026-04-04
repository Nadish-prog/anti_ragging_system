const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function testConnection(url) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    await prisma.$connect();
    fs.appendFileSync('db_result.log', `[SUCCESS] ${url}\n`);
    await prisma.$disconnect();
    return true;
  } catch (e) {
    fs.appendFileSync('db_result.log', `[FAILED] ${url} | Error: ${e.message}\n`);
    return false;
  }
}

async function run() {
  fs.writeFileSync('db_result.log', '');
  const urls = [
    "postgresql://postgres.nausykfxtbwijlwyliff:XKAW5YRUvjiK2GCx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres.nausykfxtbwijlwyliff:XKAW5YRUvjiK2GCx@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    "postgresql://postgres.nausykfxtbwijlwyliff:XKAW5YRUvjiK2GCx@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  ];

  for (const url of urls) {
    await testConnection(url);
  }
  process.exit(0);
}

run();

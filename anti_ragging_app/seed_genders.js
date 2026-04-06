const prisma = require('./src/utils/prismaClient');

async function main() {
  const genders = ['Male', 'Female', 'Other'];
  
  console.log('Seeding genders...');
  for (const gender of genders) {
    await prisma.genders.upsert({
      where: { gender_name: gender },
      update: {},
      create: { gender_name: gender },
    });
  }
  console.log('Seeded genders.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

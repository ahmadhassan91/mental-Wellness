import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  await prisma.provider.deleteMany();

  const providers = [
    {
      name: 'Dr. Sarah Mitchell',
      photoUrl: '/provider-1.jpg',
      specialties: ['Anxiety', 'Depression', 'CBT', 'Mindfulness'],
      modalities: ['telehealth', 'in_person'],
      portalLink: 'https://therapynotes.com/portal/dr-mitchell',
      acceptingNew: true,
      show: true,
    },
    {
      name: 'Dr. Michael Chen',
      photoUrl: '/provider-2.jpg',
      specialties: ['Trauma', 'PTSD', 'EMDR', 'Couples Therapy'],
      modalities: ['telehealth'],
      portalLink: 'https://therapynotes.com/portal/dr-chen',
      acceptingNew: true,
      show: true,
    },
    {
      name: 'Dr. Emily Rodriguez',
      photoUrl: '/provider-3.jpg',
      specialties: ['Family Therapy', 'Child Psychology', 'Parenting'],
      modalities: ['in_person'],
      portalLink: 'https://therapynotes.com/portal/dr-rodriguez',
      acceptingNew: false,
      show: true,
    },
    {
      name: 'Dr. James Williams',
      photoUrl: '/provider-4.jpg',
      specialties: ['Addiction', 'Substance Abuse', 'Group Therapy', 'DBT'],
      modalities: ['telehealth', 'in_person'],
      portalLink: 'https://therapynotes.com/portal/dr-williams',
      acceptingNew: true,
      show: true,
    },
  ];

  for (const provider of providers) {
    await prisma.provider.create({
      data: provider,
    });
    console.log(`Created provider: ${provider.name}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

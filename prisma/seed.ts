import { PrismaClient } from "@prisma/client";

const CategoryType = { PREDEFINED: "PREDEFINED", CUSTOM: "CUSTOM" } as const;
const CategoryScope = { GLOBAL: "GLOBAL", PROJECT: "PROJECT" } as const;

const prisma = new PrismaClient();

async function main() {
  const predefined = [
    { name: "Food" },
    { name: "Vehicle" },
    { name: "Household" },
    { name: "Medicines" },
  ];

  for (const cat of predefined) {
    await prisma.category.upsert({
      where: {
        // Use a unique combination; since predefined categories have no userId/projectId,
        // we rely on name + type + scope being unique for seeding purposes.
        id: `predefined-${cat.name.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `predefined-${cat.name.toLowerCase()}`,
        name: cat.name,
        type: CategoryType.PREDEFINED,
        scope: CategoryScope.GLOBAL,
        userId: null,
        projectId: null,
      },
    });
  }

  console.log("Seeded predefined categories: Food, Vehicle, Household, Medicines");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

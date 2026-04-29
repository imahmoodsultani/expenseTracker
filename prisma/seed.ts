import { PrismaClient } from "@prisma/client";

const CategoryType = { PREDEFINED: "PREDEFINED", CUSTOM: "CUSTOM" } as const;
const CategoryScope = { GLOBAL: "GLOBAL", PROJECT: "PROJECT" } as const;

const prisma = new PrismaClient();

async function main() {
  const predefinedNames = ["Food", "Vehicle", "Household", "Medicines"];

  await prisma.category.deleteMany({ where: { type: CategoryType.PREDEFINED } });
  await prisma.category.createMany({
    data: predefinedNames.map((name) => ({
      name,
      type: CategoryType.PREDEFINED,
      scope: CategoryScope.GLOBAL,
      userId: null,
      projectId: null,
    })),
  });

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

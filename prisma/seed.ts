import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  const rarityTier = await prisma.rarityTier.upsert({
    where: { key: "legendary" },
    update: {},
    create: {
      key: "legendary",
      label: "Legendary",
      rank: 1,
      description: "Extremely rare and valuable items",
      color: "#FFD700",
    },
  });

  const apiSource = await prisma.apiSource.upsert({
    where: { slug: "steam-market" },
    update: {},
    create: {
      name: "Steam Community Market",
      slug: "steam-market",
      baseUrl: "https://steamcommunity.com/market",
      description: "Official Steam marketplace",
      rateLimitPerMinute: 60,
      isActive: true,
    },
  });

  const market = await prisma.market.upsert({
    where: { slug: "steam-cs" },
    update: {},
    create: {
      name: "Steam CS Market",
      slug: "steam-cs",
      region: "Global",
      baseCurrency: "USD",
      isPrimary: true,
      apiSourceId: apiSource.id,
    },
  });

  console.log("Database seed completed successfully!");
  console.log({ rarityTier, apiSource, market });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

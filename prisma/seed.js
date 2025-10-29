const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  console.log('Seeding rarity tiers...');
  const rarityTiers = [
    {
      key: 'consumer_grade',
      label: 'Consumer Grade',
      rank: 1,
      description: 'Base quality tier',
      color: '#b0c3d9',
    },
    {
      key: 'industrial_grade',
      label: 'Industrial Grade',
      rank: 2,
      description: 'Common tier',
      color: '#5e98d9',
    },
    {
      key: 'mil_spec',
      label: 'Mil-Spec',
      rank: 3,
      description: 'Military-grade tier',
      color: '#4b69ff',
    },
    {
      key: 'restricted',
      label: 'Restricted',
      rank: 4,
      description: 'Moderately rare tier',
      color: '#8847ff',
    },
    {
      key: 'classified',
      label: 'Classified',
      rank: 5,
      description: 'Rare tier',
      color: '#d32ce6',
    },
    {
      key: 'covert',
      label: 'Covert',
      rank: 6,
      description: 'Very rare tier',
      color: '#eb4b4b',
    },
    {
      key: 'exceedingly_rare',
      label: 'Exceedingly Rare',
      rank: 7,
      description: 'Special items (knives, gloves)',
      color: '#ffd700',
    },
    {
      key: 'contraband',
      label: 'Contraband',
      rank: 8,
      description: 'Limited availability',
      color: '#e4ae39',
    },
  ];

  for (const tier of rarityTiers) {
    await prisma.rarityTier.upsert({
      where: { key: tier.key },
      update: tier,
      create: tier,
    });
  }
  console.log(`Seeded ${rarityTiers.length} rarity tiers`);

  console.log('Seeding API sources...');
  const apiSources = [
    {
      name: 'Steam Community Market',
      slug: 'steam_community',
      baseUrl: 'https://steamcommunity.com/market',
      description: 'Official Valve marketplace for CS:GO skins',
      dataLicense: 'Steam Web API Terms',
      rateLimitPerMinute: 20,
      isActive: true,
      metadata: {
        type: 'primary',
        requiresAuth: true,
        currency: 'USD',
      },
    },
    {
      name: 'CS:GO Backpack',
      slug: 'csgo_backpack',
      baseUrl: 'https://csgobackpack.net',
      description: 'Community price aggregator',
      rateLimitPerMinute: 60,
      isActive: true,
      metadata: {
        type: 'aggregator',
        requiresAuth: false,
        currency: 'USD',
      },
    },
    {
      name: 'Buff163',
      slug: 'buff163',
      baseUrl: 'https://buff.163.com',
      description: 'Popular Chinese marketplace',
      rateLimitPerMinute: 30,
      isActive: true,
      metadata: {
        type: 'marketplace',
        requiresAuth: false,
        currency: 'CNY',
        region: 'CN',
      },
    },
    {
      name: 'DMarket',
      slug: 'dmarket',
      baseUrl: 'https://api.dmarket.com',
      description: 'Cross-game marketplace API',
      rateLimitPerMinute: 100,
      isActive: true,
      metadata: {
        type: 'marketplace',
        requiresAuth: true,
        currency: 'USD',
      },
    },
    {
      name: 'SkinPort',
      slug: 'skinport',
      baseUrl: 'https://api.skinport.com',
      description: 'Instant-sale CS:GO marketplace',
      rateLimitPerMinute: 60,
      isActive: true,
      metadata: {
        type: 'marketplace',
        requiresAuth: false,
        currency: 'EUR',
      },
    },
  ];

  for (const source of apiSources) {
    await prisma.apiSource.upsert({
      where: { slug: source.slug },
      update: source,
      create: source,
    });
  }
  console.log(`Seeded ${apiSources.length} API sources`);

  console.log('Seeding baseline markets...');
  const markets = [
    {
      name: 'Steam Community Market',
      slug: 'steam_community',
      region: 'GLOBAL',
      baseCurrency: 'USD',
      timezone: 'UTC',
      description: 'Official Valve trading platform',
      isPrimary: true,
      supportsSnapshots: true,
      metadata: {
        commissionRate: 0.15,
        minPrice: 0.03,
      },
    },
    {
      name: 'Buff163 Market',
      slug: 'buff163',
      region: 'CN',
      baseCurrency: 'CNY',
      timezone: 'Asia/Shanghai',
      description: 'Leading Chinese CS:GO marketplace',
      isPrimary: false,
      supportsSnapshots: true,
      metadata: {
        commissionRate: 0.025,
        exchangeRateVsUSD: 7.2,
      },
    },
    {
      name: 'DMarket',
      slug: 'dmarket',
      region: 'GLOBAL',
      baseCurrency: 'USD',
      timezone: 'UTC',
      description: 'Blockchain-based marketplace',
      isPrimary: false,
      supportsSnapshots: true,
      metadata: {
        commissionRate: 0.07,
        blockchainBased: true,
      },
    },
    {
      name: 'SkinPort',
      slug: 'skinport',
      region: 'EU',
      baseCurrency: 'EUR',
      timezone: 'Europe/Berlin',
      description: 'European instant-buy marketplace',
      isPrimary: false,
      supportsSnapshots: true,
      metadata: {
        commissionRate: 0.12,
        instantPurchase: true,
      },
    },
  ];

  const apiSourceMap = {};
  const dbApiSources = await prisma.apiSource.findMany();
  for (const source of dbApiSources) {
    apiSourceMap[source.slug] = source.id;
  }

  for (const market of markets) {
    const apiSourceId = apiSourceMap[market.slug] || null;
    await prisma.market.upsert({
      where: { slug: market.slug },
      update: { ...market, apiSourceId },
      create: { ...market, apiSourceId },
    });
  }
  console.log(`Seeded ${markets.length} baseline markets`);

  console.log('Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during database seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

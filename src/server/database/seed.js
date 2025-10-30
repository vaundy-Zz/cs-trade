import { query } from './db.js';

const skins = [
  { id: 'skin-001', name: 'AWP | Dragon Lore', market: 'Steam Market' },
  { id: 'skin-002', name: 'AK-47 | Fire Serpent', market: 'Steam Market' },
  { id: 'skin-003', name: 'M4A4 | Howl', market: 'Steam Market' },
  { id: 'skin-001', name: 'AWP | Dragon Lore', market: 'CS.Money' },
  { id: 'skin-002', name: 'AK-47 | Fire Serpent', market: 'CS.Money' },
];

function generateRandomWalk(basePrice, days, volatility = 0.05) {
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days * 24; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5);
    prices.push({
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date(Date.now() - (days * 24 - i) * 60 * 60 * 1000)
    });
  }
  
  return prices;
}

async function seed() {
  console.log('Seeding database...');
  
  await query('DELETE FROM market_data');
  
  const basePrices = {
    'skin-001': 8000,
    'skin-002': 3000,
    'skin-003': 5000
  };
  
  for (const skin of skins) {
    const basePrice = basePrices[skin.id];
    const priceData = generateRandomWalk(basePrice, 90, 0.03);
    
    for (const data of priceData) {
      await query(
        `INSERT INTO market_data (skin_id, skin_name, market_name, price, volume, timestamp) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [skin.id, skin.name, skin.market, data.price, data.volume, data.timestamp]
      );
    }
    
    console.log(`Seeded ${priceData.length} records for ${skin.name} on ${skin.market}`);
  }
  
  console.log('Refreshing materialized views...');
  await query('SELECT refresh_analytics_views()');
  
  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

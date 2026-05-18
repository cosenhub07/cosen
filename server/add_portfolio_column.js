require('dotenv').config();
const { supabase } = require('./config/db');

async function migrate() {
  console.log('Running migration: add portfolio_images to services...');

  // Insert a temp row update to force the column — we use a raw select first to test if column exists
  const { data, error } = await supabase
    .from('services')
    .select('portfolio_images')
    .limit(1);

  if (!error) {
    console.log('✅ portfolio_images column already exists. No migration needed.');
    process.exit(0);
  }

  console.log('Column does not exist. Please run this SQL in your Supabase dashboard:');
  console.log('');
  console.log('ALTER TABLE services ADD COLUMN IF NOT EXISTS portfolio_images text[] DEFAULT ARRAY[]::text[];');
  console.log('');
  console.log('Go to: https://supabase.com/dashboard/project/lasgvbjdsqzfbggehpjg/editor');
  process.exit(1);
}

migrate();

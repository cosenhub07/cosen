require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.replace('https://','').replace('.supabase.co','');

// We want to add 'Food Friendship' to the enum type `service_category`
const SQL = `ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'Food Friendship';`;

const body = JSON.stringify({ query: SQL });
const options = {
  hostname: `${PROJECT_REF}.supabase.co`,
  path: '/rest/v1/rpc/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', data);
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
      console.log('✅ successfully added Food Friendship to service_category enum!');
    } else {
      console.log('❌ Could not auto-run SQL. Please run this in the Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/lasgvbjdsqzfbggehpjg/sql/new\n');
      console.log(SQL);
    }
  });
});
req.on('error', (e) => {
  console.error('Request Error:', e);
});
req.write(body);
req.end();

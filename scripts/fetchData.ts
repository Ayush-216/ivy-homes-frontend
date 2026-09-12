import fs from 'fs';
import path from 'path';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'IVY26-3F9AD1C6793C';
const BASE_URL = 'https://solve.ivy.homes';
const EMAIL = 'demo1@ivy.homes';
const PASSWORD = 'cde483bd0b';

async function sweepEndpoint(endpoint: string, token: string) {
  console.log(`\nSweeping ${endpoint}...`);
  let offset = 0;
  const limit = 200; 
  const allRecords: any[] = [];
  let keepFetching = true;

  while (keepFetching) {
    // Replaced 'page' with 'offset'
    const url = `${BASE_URL}${endpoint}?offset=${offset}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-API-Key': API_KEY }
    });

    if (!response.ok) {
      console.error(`Failed at offset ${offset}: ${response.status} ${await response.text()}`);
      break;
    }

    const data = await response.json();
    const results = data.results || data.data || [];
    
    if (results.length === 0) break;

    allRecords.push(...results);
    process.stdout.write(`\rFetched offset ${offset} (${allRecords.length} total records)`);
    
    // Rely on the API's actual 'has_more' flag instead of guessing
    if (data.has_more === false) {
      keepFetching = false;
    } else {
      // Increment offset by the number of records we actually got
      offset += results.length;
    }
  }

  console.log('\n');
  const filename = endpoint.replace('/v1/', '') + '.json';
  const filepath = path.join(process.cwd(), 'data', filename);
  fs.writeFileSync(filepath, JSON.stringify(allRecords, null, 2));
  console.log(`Saved ${allRecords.length} records to data/${filename}`);
}

async function run() {
  console.log('Authenticating...');
  const authResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  
  const authData = await authResponse.json();
  const token = authData.access_token; // Using the real key we found
  
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  await sweepEndpoint('/v1/listings', token);
  await sweepEndpoint('/v1/rentals', token);
  await sweepEndpoint('/v1/projects', token);
  
  console.log('\nAll data downloaded successfully!');
}

run();
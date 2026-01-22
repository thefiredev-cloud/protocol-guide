const mysql = require('mysql2/promise');

// Official California LEMSAs (33 total)
const officialLEMSAs = [
  'Alameda County EMS Agency',
  'Central California EMS Agency',
  'Coastal Valleys EMS Agency',
  'Contra Costa County EMS',
  'El Dorado County EMS Agency',
  'Imperial County EMS Agency',
  'Inland Counties EMS Agency',
  'Kern County EMS',
  'Los Angeles County EMS Agency',
  'Marin County EMS',
  'Merced County EMS Agency',
  'Monterey County EMS Agency',
  'Mountain-Valley EMS Agency',
  'Napa County EMS',
  'North Coast EMS',
  'Northern California EMS Inc',
  'Orange County EMS Agency',
  'Riverside County EMS Agency',
  'Sacramento County EMS Agency',
  'San Benito County EMS',
  'San Diego County EMS',
  'San Francisco EMS Agency',
  'San Joaquin County EMS Agency',
  'San Luis Obispo County EMS Agency',
  'San Mateo County EMS Agency',
  'Santa Barbara County EMS Agency',
  'Santa Clara County EMS Agency',
  'Santa Cruz County EMS',
  'Sierra-Sacramento Valley EMS Agency',
  'Solano County EMS',
  'Ventura County EMS Agency',
  'Yolo County EMS Agency',
];

async function main() {
  const url = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '4000'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1).split('?')[0],
    ssl: { rejectUnauthorized: true }
  });
  
  const [agencies] = await conn.execute(
    "SELECT c.name, COUNT(p.id) as protocol_count FROM counties c LEFT JOIN protocolChunks p ON c.id = p.countyId WHERE c.state = 'California' GROUP BY c.name ORDER BY c.name"
  );
  
  const dbNames = agencies.map(a => a.name.toLowerCase());
  
  console.log('=== California LEMSA Coverage Analysis ===\n');
  console.log('Agencies in Database:', agencies.length);
  console.log('Official California LEMSAs:', officialLEMSAs.length);
  
  let totalProtocols = 0;
  console.log('\nCurrent Coverage:');
  agencies.forEach(a => {
    totalProtocols += parseInt(a.protocol_count);
    console.log(`  ${a.name}: ${a.protocol_count} protocols`);
  });
  console.log(`\nTotal California Protocols: ${totalProtocols}`);
  
  // Check which official LEMSAs are missing
  console.log('\n=== Missing Official LEMSAs ===');
  const missing = [];
  officialLEMSAs.forEach(lemsa => {
    const lemsaLower = lemsa.toLowerCase();
    const found = dbNames.some(n => {
      // Check for partial match
      const words = lemsaLower.split(' ');
      return words.some(w => w.length > 3 && n.includes(w));
    });
    if (!found) {
      missing.push(lemsa);
      console.log(`  - ${lemsa}`);
    }
  });
  
  if (missing.length === 0) {
    console.log('  All official LEMSAs are covered!');
  }
  
  const coverage = ((officialLEMSAs.length - missing.length) / officialLEMSAs.length * 100).toFixed(1);
  console.log(`\n=== Coverage: ${coverage}% (${officialLEMSAs.length - missing.length}/${officialLEMSAs.length} LEMSAs) ===`);
  
  await conn.end();
}

main().catch(console.error);

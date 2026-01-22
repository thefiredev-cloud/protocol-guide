const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function importProtocols() {
  const protocols = JSON.parse(fs.readFileSync('/home/ubuntu/national_protocols_to_import.json', 'utf8'));
  console.log('Loaded', protocols.length, 'protocols');
  
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT || '4000'),
    ssl: { rejectUnauthorized: true }
  });
  
  console.log('Connected to database');
  
  // Group by agency
  const byAgency = {};
  for (const p of protocols) {
    const key = p.state + '|' + p.agency;
    if (!byAgency[key]) {
      byAgency[key] = [];
    }
    byAgency[key].push(p);
  }
  
  console.log('Found', Object.keys(byAgency).length, 'agencies');
  
  let imported = 0;
  
  for (const [key, agencyProtocols] of Object.entries(byAgency)) {
    const [state, agency] = key.split('|');
    
    try {
      // Get or create agency
      let [rows] = await conn.execute(
        'SELECT id FROM counties WHERE name = ? AND state = ? LIMIT 1',
        [agency.substring(0, 255), state.substring(0, 100)]
      );
      
      let agencyId;
      if (rows.length > 0) {
        agencyId = rows[0].id;
      } else {
        const [result] = await conn.execute(
          'INSERT INTO counties (name, state, protocolVersion, createdAt) VALUES (?, ?, ?, NOW())',
          [agency.substring(0, 255), state.substring(0, 100), '2025']
        );
        agencyId = result.insertId;
        console.log('Created:', agency, '(' + state + ')');
      }
      
      // Insert protocols
      for (const p of agencyProtocols) {
        await conn.execute(
          'INSERT INTO protocolChunks (countyId, protocolNumber, title, section, content, sourceUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [agencyId, p.number.substring(0, 50), p.title.substring(0, 255), p.section.substring(0, 255), p.content.substring(0, 65000), p.url ? p.url.substring(0, 500) : null]
        );
        imported++;
      }
      
      if (imported % 500 === 0) {
        console.log('Imported', imported, 'protocols...');
      }
    } catch (e) {
      console.error('Error with', agency, ':', e.message);
    }
  }
  
  console.log('Total imported:', imported);
  await conn.end();
}

importProtocols().catch(console.error);

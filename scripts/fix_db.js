const { Client } = require('pg');
require('dotenv').config();

// Fix connection string for PG client (strip prisma+ and arguments)
let connectionString = process.env.DATABASE_URL;
if (connectionString.startsWith('prisma+')) {
    connectionString = connectionString.replace('prisma+', '');
}
// Remove params like ?api_key=... for PG connection if they are prisma specific?
// Actually, for Accelerate, the API key IS the auth. 
// "postgres://accelerate.prisma-data.net/?api_key=..."
// PG Client supports connection string with params. Let's try as is (minus prisma+).

console.log("Connecting to:", connectionString.split('?')[0] + '...');

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for most cloud DBs
});

async function run() {
    try {
        await client.connect();
        console.log("Connected!");

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log("Tables found:", res.rows.map(r => r.table_name));

        // Check if messages exists
        const messages = res.rows.find(r => r.table_name === 'messages');
        if (messages) {
            console.log("✅ 'messages' table found!");

            // Check columns
            const cols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'messages'
        `);
            console.log("Columns:", cols.rows.map(r => r.column_name));

            // Try to alter
            console.log("Attempting to add columns...");
            await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;`);
            await client.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;`);
            console.log("✅ Columns added successfully!");

        } else {
            console.log("❌ 'messages' table NOT found in this DB.");
        }

    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await client.end();
    }
}

run();

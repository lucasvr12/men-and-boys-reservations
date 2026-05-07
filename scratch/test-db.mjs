import { createClient } from "@vercel/postgres";

const client = createClient({
  connectionString: "postgres://780a6d44dcf88a8d758e30f39980bbf5c6173254d9675cb4fd34932cff8bd1ac:sk_0Ox3XbVgQqJeNb5lkhKMH@db.prisma.io:5432/postgres?sslmode=require"
});

async function main() {
  await client.connect();
  console.log("Connected");

  try {
    const res = await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        surname TEXT,
        branch TEXT,
        stylist TEXT,
        service TEXT,
        day TEXT,
        time TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table created:", res);
  } catch (err) {
    console.error("Error creating table:", err);
  }

  await client.end();
}

main();

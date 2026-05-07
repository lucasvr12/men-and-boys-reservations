import { createClient } from "@vercel/postgres";

// Helper to get a connected client
async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

export async function initDB() {
  const client = await getClient();
  try {
    await client.query(`
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
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await client.end();
  }
}

export async function getCustomerByPhone(phone) {
  const client = await getClient();
  try {
    const res = await client.query('SELECT * FROM customers WHERE phone = $1 LIMIT 1;', [phone]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error fetching customer from Postgres:", error);
    return null;
  } finally {
    await client.end();
  }
}

export async function saveCustomer(customerData) {
  const { phone, name, surname, branch, stylist, service, day, time } = customerData;
  
  // We do everything in one single connection to avoid hitting Vercel Postgres connection limits!
  const client = await getClient();
  try {
    // 1. Ensure table exists
    await client.query(`
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
    
    // 2. Check existing
    const res = await client.query('SELECT * FROM customers WHERE phone = $1 LIMIT 1;', [phone]);
    const existing = res.rows[0] || null;
    
    const pName = name || null;
    const pSurname = surname || null;
    const pBranch = branch || null;
    const pStylist = stylist || null;
    const pService = service || null;
    const pDay = day || null;
    const pTime = time || null;

    // 3. Update or Insert
    if (existing) {
      await client.query(`
        UPDATE customers 
        SET 
          name = $2, 
          surname = $3, 
          branch = $4, 
          stylist = $5, 
          service = $6, 
          day = $7, 
          time = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE phone = $1;
      `, [phone, pName, pSurname, pBranch, pStylist, pService, pDay, pTime]);
    } else {
      await client.query(`
        INSERT INTO customers (phone, name, surname, branch, stylist, service, day, time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [phone, pName, pSurname, pBranch, pStylist, pService, pDay, pTime]);
    }
    return true;
  } catch (error) {
    console.error("Error saving customer to Postgres:", error);
    return false;
  } finally {
    await client.end();
  }
}

export async function getAllCustomers() {
  const client = await getClient();
  try {
    const res = await client.query('SELECT * FROM customers ORDER BY name ASC;');
    return res.rows;
  } catch (error) {
    console.error("Error fetching all customers from Postgres:", error);
    return [];
  } finally {
    await client.end();
  }
}

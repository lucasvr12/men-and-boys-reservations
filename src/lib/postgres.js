import { createClient } from "@vercel/postgres";

export async function initDB() {
  const client = createClient();
  try {
    await client.connect();
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
  const client = createClient();
  try {
    await client.connect();
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
  const client = createClient();
  
  try {
    await initDB();
    const existing = await getCustomerByPhone(phone);
    
    // Convert undefined to null for Postgres
    const pName = name || null;
    const pSurname = surname || null;
    const pBranch = branch || null;
    const pStylist = stylist || null;
    const pService = service || null;
    const pDay = day || null;
    const pTime = time || null;

    await client.connect();

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
    if (client.isOpen) { // Or try catch
        try { await client.end(); } catch (e) {}
    }
  }
}

export async function getAllCustomers() {
  const client = createClient();
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM customers ORDER BY name ASC;');
    return res.rows;
  } catch (error) {
    console.error("Error fetching all customers from Postgres:", error);
    return [];
  } finally {
    await client.end();
  }
}


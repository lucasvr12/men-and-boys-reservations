import { sql } from "@vercel/postgres";

export async function initDB() {
  try {
    // Create customers table if not exists
    await sql`
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
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function getCustomerByPhone(phone) {
  try {
    const { rows } = await sql`
      SELECT * FROM customers WHERE phone = ${phone} LIMIT 1;
    `;
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching customer from Postgres:", error);
    return null;
  }
}

export async function saveCustomer(customerData) {
  const { phone, name, surname, branch, stylist, service, day, time } = customerData;
  
  try {
    const existing = await getCustomerByPhone(phone);
    
    if (existing) {
      await sql`
        UPDATE customers 
        SET 
          name = ${name}, 
          surname = ${surname}, 
          branch = ${branch}, 
          stylist = ${stylist}, 
          service = ${service}, 
          day = ${day}, 
          time = ${time},
          updated_at = CURRENT_TIMESTAMP
        WHERE phone = ${phone};
      `;
    } else {
      await sql`
        INSERT INTO customers (phone, name, surname, branch, stylist, service, day, time)
        VALUES (${phone}, ${name}, ${surname}, ${branch}, ${stylist}, ${service}, ${day}, ${time});
      `;
    }
    return true;
  } catch (error) {
    console.error("Error saving customer to Postgres:", error);
    return false;
  }
}

export async function getAllCustomers() {
  try {
    const { rows } = await sql`
      SELECT * FROM customers ORDER BY name ASC;
    `;
    return rows;
  } catch (error) {
    console.error("Error fetching all customers from Postgres:", error);
    return [];
  }
}

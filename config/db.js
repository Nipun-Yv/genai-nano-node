import pg from "pg"
import dotenv from "dotenv"

dotenv.config({path:"./.env"})
export const pool=new pg.Pool({
    connectionString:process.env.DATABASE_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false  
    }
})

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connection established successfully");
    client.release(); 
  } catch (err) {
    console.error("Error connecting to the DB:", err.message);
    throw err;
  }
};
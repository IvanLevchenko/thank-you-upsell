import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DATABASE_URL || "";
const parsedUrl = new URL(DB_URL);
const DB_NAME = parsedUrl.pathname.slice(1);

const adminClient = new Client({
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port),
  user: parsedUrl.username,
  password: parsedUrl.password,
  // database: DB_NAME,
});

async function ensureDatabase() {
  await adminClient.connect();

  const res = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME],
  );

  if (res.rowCount === 0) {
    console.log(`Database "${DB_NAME}" not found. Creating...`);
    await adminClient.query(`CREATE DATABASE "${DB_NAME}"`);
  } else {
    console.log(`Database "${DB_NAME}" already exists.`);
  }

  await adminClient.end();
}

console.log("Checking database...");
ensureDatabase().catch(console.error);

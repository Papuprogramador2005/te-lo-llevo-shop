import { MongoClient, ServerApiVersion } from "mongodb";

let client;
let database;

export async function connectDatabase() {
  if (database) return database;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Add it to the server .env file.");

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  await client.db("admin").command({ ping: 1 });
  database = client.db(process.env.MONGODB_DB_NAME || "te_lo_llevo");

  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("products").createIndex({ active: 1, category: 1 }),
    database.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
    database.collection("orders").createIndex({ assignedEmployeeId: 1, createdAt: -1 }),
  ]);

  return database;
}

export function getDatabase() {
  if (!database) throw new Error("Database is not connected yet.");
  return database;
}

export function getClient() {
  if (!client) throw new Error("Database is not connected yet.");
  return client;
}

export async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}

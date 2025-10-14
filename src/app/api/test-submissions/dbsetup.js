import { MongoClient } from 'mongodb';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI env var not set');
}

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export async function connectToDatabase(dbName = 'test-hub') {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(uri, { connectTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}

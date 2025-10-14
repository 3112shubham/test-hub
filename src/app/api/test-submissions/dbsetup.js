// dbsetup.js
import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI env var not set");

// Global cache across hot reloads (Vercel/Next.js dev)
let cached = global._mongo;
if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

export async function connectToDatabase(dbName = "test-hub") {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 60000, // 1 min
      connectTimeoutMS: 20000,
      serverSelectionTimeoutMS: 30000,
      tls: true,
      retryWrites: true,
    };

    const client = new MongoClient(uri, opts);
    cached.promise = client.connect().then((client) => ({
      client,
      db: client.db(dbName),
    }));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

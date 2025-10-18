import { MongoClient } from "mongodb";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI; // your MongoDB connection string
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

// Global variable to cache the MongoClient in development

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;

// Optional helper functions for collections
export async function getQueueCollection() {
  const client = await clientPromise;
  return client.db("test-hub").collection("queue"); // Change DB/collection as needed
}

export async function getTestSubmissionsCollection() {
  const client = await clientPromise;
  return client.db("test-hub").collection("testSubmissions");
}

export async function getTestsCollection() {
  const client = await clientPromise;
  return client.db("test-hub").collection("tests");
}

// src/app/api/test-mongo/route.js
import { NextResponse } from "next/server";
import { getQueueCollection } from "@/lib/mongo.js";

export async function POST(req) {
  try {
    const data = await req.json();
    const queue = await getQueueCollection();
    await queue.insertOne({ ...data, createdAt: new Date() });
    return NextResponse.json({ message: "MongoDB POST OK" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const queue = await getQueueCollection();
    const count = await queue.countDocuments();
    return NextResponse.json({ message: "MongoDB GET OK", queueCount: count });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

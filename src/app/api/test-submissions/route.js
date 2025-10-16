// /app/api/test-submissions/route.js
import { NextResponse } from "next/server";
import { getQueueCollection } from "@/lib/mongo.js";

export async function POST(req) {
  try {
    const data = await req.json();
    const queue = await getQueueCollection();

    await queue.insertOne({
      ...data,
      createdAt: new Date(),
      synced: false, // ✅ ensure new entries can be found later
    });

    return NextResponse.json({ message: "Stored in MongoDB queue" });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

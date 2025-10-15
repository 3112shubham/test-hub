// /app/api/test-submissions/sync/route.js
import { NextResponse } from "next/server";
import { getQueueCollection } from "@/lib/mongo.js";
import { batchWriteResponses } from "@/lib/testOperations.js";

export async function POST() {
  try {
    const queue = await getQueueCollection();

    // 1️⃣ Fetch unsynced data
    const unsynced = await queue.find({ synced: false }).toArray();
    if (!unsynced.length) {
      return NextResponse.json({ message: "No unsynced submissions" });
    }

    // 2️⃣ Group by testId (so each test writes once)
    const grouped = {};
    for (const doc of unsynced) {
      const testId = doc.testId.toString();
      if (!grouped[testId]) grouped[testId] = [];
      grouped[testId].push(doc.response[0]); // assuming single response array
    }

    // 3️⃣ Write to Firestore for each test
    for (const [testId, responses] of Object.entries(grouped)) {
      await batchWriteResponses(testId, responses);
    }

    // 4️⃣ Mark them as synced
    const ids = unsynced.map(d => d._id);
    await queue.updateMany(
      { _id: { $in: ids } },
      { $set: { synced: true, syncedAt: new Date() } }
    );

    return NextResponse.json({
      message: `Synced ${unsynced.length} submissions to Firestore.`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

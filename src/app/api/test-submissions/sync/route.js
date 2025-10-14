import { connectToDatabase } from '../dbsetup';
import { NextResponse } from 'next/server';
import { addTestResponse } from '@/lib/testOperations';
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const queue = db.collection('submissionQueue');

    // Fetch pending items (limit to 100 per run)
    const pending = await queue.find({ status: 'pending' }).limit(100).toArray();

    const results = [];
    for (const item of pending) {
      try {
        const payload = item.payload;
        // Expect payload to contain { testId, responsesArray, meta }
        if (!payload || !payload.testId) {
          await queue.updateOne({ _id: item._id }, { $set: { status: 'failed', error: 'missing testId' } });
          results.push({ id: item._id, status: 'failed', reason: 'missing testId' });
          continue;
        }

        // Call addTestResponse to persist to Firestore
        await addTestResponse(payload.testId, payload);

        // Mark processed
        await queue.deleteOne({ _id: item._id });
        results.push({ id: item._id, status: 'processed' });
      } catch (err) {
        console.error('Sync item failed', item._id, err);
        await queue.updateOne({ _id: item._id }, { $set: { status: 'failed', error: String(err) } });
        results.push({ id: item._id, status: 'failed', reason: String(err) });
      }
    }

    return NextResponse.json({ processed: results.length, details: results });
  } catch (err) {
    console.error('Sync error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

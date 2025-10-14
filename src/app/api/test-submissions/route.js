import { connectToDatabase } from './dbsetup';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { db } = await connectToDatabase();

    const queue = db.collection('submissionQueue');
    const doc = {
      payload: body,
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await queue.insertOne(doc);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('Enqueue error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

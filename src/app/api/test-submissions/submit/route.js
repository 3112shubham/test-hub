import { NextResponse } from "next/server";
import { batchWriteResponses } from "@/lib/testOperations";

export async function POST(req) {
  try {
    const body = await req.json();
    const { testId, responsesArray } = body;

    if (!testId || !Array.isArray(responsesArray)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await batchWriteResponses(testId.toString(), responsesArray);  // ensure string

    return NextResponse.json({ message: "Re sponses saved" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

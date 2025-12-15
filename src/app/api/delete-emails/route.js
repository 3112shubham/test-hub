import { getEmailsCollection } from "@/lib/mongo";

export async function POST(req) {
  try {
    const { testId } = await req.json();

    if (!testId) {
      return new Response(
        JSON.stringify({ error: "testId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailsCollection = await getEmailsCollection();

    console.log(`Attempting to delete emails document for testId: ${testId}`);

    // Delete the document with the matching testId
    const result = await emailsCollection.deleteOne({ testId: testId });

    console.log(`Delete result:`, result);

    if (result.deletedCount === 0) {
      console.warn(`No document found with testId: ${testId}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Emails deleted from MongoDB",
        deletedCount: result.deletedCount,
        testId: testId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting emails:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete emails from MongoDB",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

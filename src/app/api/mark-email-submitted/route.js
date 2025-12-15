import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    const { testId, email } = await request.json();

    if (!testId || !email) {
      return Response.json(
        { error: "Missing testId or email" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const mongoDb = client.db("test-hub");
    const emailsCollection = mongoDb.collection("emails");

    const emailLower = email.toLowerCase();

    // Update the email to mark as submitted
    const result = await emailsCollection.updateOne(
      { testId, "emails.email": emailLower },
      {
        $set: {
          "emails.$.submitted": true,
          "emails.$.submittedAt": new Date(),
          "updatedAt": new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Email or test not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Email marked as submitted",
    });
  } catch (error) {
    console.error("Error marking email as submitted:", error);
    return Response.json(
      { error: "Failed to mark email as submitted: " + error.message },
      { status: 500 }
    );
  }
}

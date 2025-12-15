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

    // Find the emails document for this test
    const doc = await emailsCollection.findOne({ testId });

    if (!doc) {
      return Response.json({
        exists: false,
        submitted: false,
        message: "No emails registered for this test",
      });
    }

    // Check if email exists in the emails array (case-insensitive)
    const emailLower = email.toLowerCase();
    const emailEntry = doc.emails.find(
      (e) => (typeof e === 'string' ? e.toLowerCase() === emailLower : e.email.toLowerCase() === emailLower)
    );

    if (!emailEntry) {
      return Response.json({
        exists: false,
        submitted: false,
        message: "Email not found in the approved list",
      });
    }

    // Check if already submitted
    const isSubmitted = typeof emailEntry === 'object' && emailEntry.submitted === true;

    return Response.json({
      exists: true,
      submitted: isSubmitted,
      message: isSubmitted
        ? "This test has already been submitted from this email"
        : "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return Response.json(
      { error: "Failed to verify email: " + error.message },
      { status: 500 }
    );
  }
}

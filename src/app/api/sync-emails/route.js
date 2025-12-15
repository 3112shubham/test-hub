import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    const { testId, emails, testName } = await request.json();

    if (!testId || !emails || !Array.isArray(emails)) {
      return Response.json(
        { error: "Missing testId or emails" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const mongoDb = client.db("test-hub");
    const emailsCollection = mongoDb.collection("emails");

    // Check if document exists for this test
    const existingDoc = await emailsCollection.findOne({ testId });

    // Convert emails to objects with submitted status
    const emailObjects = emails.map(email => ({
      email: email.toLowerCase(),
      submitted: false,
      addedAt: new Date(),
      submittedAt: null
    }));

    // If updating, merge with existing emails (keep submitted status for existing ones)
    let finalEmails = emailObjects;
    if (existingDoc && existingDoc.emails && Array.isArray(existingDoc.emails)) {
      const existingEmailMap = new Map(
        existingDoc.emails.map(e => [
          typeof e === 'string' ? e.toLowerCase() : e.email.toLowerCase(),
          typeof e === 'string' ? { email: e, submitted: false } : e
        ])
      );
      
      // Merge: keep existing with their status, add new ones
      finalEmails = emailObjects.map(newEmail => 
        existingEmailMap.get(newEmail.email) || newEmail
      );
    }

    let result;
    if (existingDoc) {
      // Update existing document with new emails
      result = await emailsCollection.updateOne(
        { testId },
        {
          $set: {
            emails: finalEmails,
            testName: testName || existingDoc.testName,
            updatedAt: new Date(),
            syncedAt: new Date(),
          },
        }
      );
    } else {
      // Create new document
      result = await emailsCollection.insertOne({
        testId,
        testName: testName || "Unnamed Test",
        emails: finalEmails,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: new Date(),
      });
    }

    return Response.json({
      success: true,
      message: `Synced ${emails.length} email${emails.length !== 1 ? "s" : ""} to MongoDB`,
      emailCount: emails.length,
      mongoOperation: existingDoc ? "updated" : "created",
    });
  } catch (error) {
    console.error("Error syncing emails:", error);
    return Response.json(
      { error: "Failed to sync emails: " + error.message },
      { status: 500 }
    );
  }
}

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function GET(request) {
  try {
    const testId = request.nextUrl.searchParams.get("id");

    if (!testId) {
      return Response.json(
        { error: "Missing test ID" },
        { status: 400 }
      );
    }

    // Use server-side Firestore query with shorter timeout
    const testsRef = collection(db, "tests");
    const q = query(testsRef, where("__name__", "==", testId));
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return Response.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    const testData = snapshot.docs[0].data();
    
    // Check if test is active
    if (testData.status !== "active") {
      return Response.json(
        { error: "Test is not active" },
        { status: 403 }
      );
    }

    // Serialize dates
    const serialized = JSON.parse(
      JSON.stringify(testData, (k, v) => {
        if (v && typeof v === "object") {
          if (typeof v.toDate === "function") return v.toDate().toISOString();
          if (v.seconds && typeof v.seconds === "number") return new Date(v.seconds * 1000).toISOString();
        }
        return v;
      })
    );

    return Response.json({
      id: snapshot.docs[0].id,
      ...serialized,
    }, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      }
    });
  } catch (error) {
    console.error("Error loading test:", error);
    return Response.json(
      { error: "Failed to load test: " + error.message },
      { status: 500 }
    );
  }
}

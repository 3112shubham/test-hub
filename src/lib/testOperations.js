import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { auth } from "./firebaseConfig";

export const batchWriteResponses = async (testId, responsesArray) => {
  if (!testId || typeof testId !== "string") {
    throw new Error("Invalid testId for batchWriteResponses");
  }

  if (!Array.isArray(responsesArray) || responsesArray.length === 0) return;

  const testRef = doc(db, "tests", testId);

  // Collect all new responses first
  const newResponses = responsesArray.map((resp) => ({
    responseId:
      Date.now().toString() + Math.random().toString(36).substring(2, 8), // Ensure uniqueness
    submittedAt: new Date(),
    status: "active",
    totalQuestions: resp.answersArr?.length || 0,
    testName: resp.meta?.testName || null,
    answers: resp.answersArr || [],
    customResponses: resp.customArr || [],
  }));

  // Update Firestore once with all responses
  await updateDoc(testRef, {
    responses: arrayUnion(...newResponses),
    totalResponses: increment(newResponses.length),
    updatedAt: serverTimestamp(),
  });
};

// Create a new test
export const createTest = async (testData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const testWithMetadata = {
      ...testData,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Use status to represent visibility: 'published' or 'unpublished' (default)
      status: "inactive",
      responses: [],
      totalResponses: 0,
    };

    const docRef = await addDoc(collection(db, "tests"), testWithMetadata);
    return { id: docRef.id, ...testWithMetadata };
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

// Publish a test (set status to 'published')
export const publishTest = async (testId) => {
  try {
    const testRef = doc(db, "tests", testId);
    await updateDoc(testRef, {
      status: "active",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error publishing test:", error);
    throw error;
  }
};

// Unpublish a test (set status to 'unpublished')
export const unpublishTest = async (testId) => {
  try {
    const testRef = doc(db, "tests", testId);
    await updateDoc(testRef, {
      status: "inactive",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error unpublishing test:", error);
    throw error;
  }
};

// Get all tests for current user with better error handling
export const getUserTests = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Try the indexed query first
    try {
      const q = query(
        collection(db, "tests"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const tests = [];

      querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() });
      });

      return tests;
    } catch (indexError) {
      // If index error, fall back to client-side sorting
      console.warn(
        "Index not ready, falling back to client-side sorting:",
        indexError
      );

      const q = query(
        collection(db, "tests"),
        where("createdBy", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const tests = [];

      querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() });
      });

      // Sort by createdAt on client side
      return tests.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
    }
  } catch (error) {
    console.error("Error getting user tests:", error);
    throw error;
  }
};

// Alternative method without ordering (if index is taking too long)
export const getUserTestsSimple = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, "tests"),
      where("createdBy", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const tests = [];

    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() });
    });

    return tests;
  } catch (error) {
    console.error("Error getting user tests:", error);
    throw error;
  }
};

// Get a single test by ID
export const getTestById = async (testId) => {
  const docRef = doc(db, "tests", testId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Test not found");
  }
};

// Add a response to a test
export const addTestResponse = async (testId, responseData) => {
  try {
    const testRef = doc(db, "tests", testId);
    const testDoc = await getDoc(testRef);

    if (!testDoc.exists()) throw new Error("Test not found");

    const testData = testDoc.data();
    const newResponse = {
      ...responseData,
      submittedAt: serverTimestamp(),
      responseId: Date.now().toString(),
    };

    const updatedResponses = [...(testData.responses || []), newResponse];

    await updateDoc(testRef, {
      responses: updatedResponses,
      totalResponses: updatedResponses.length,
      updatedAt: serverTimestamp(),
    });

    return newResponse;
  } catch (error) {
    console.error("Error adding test response:", error);
    throw error;
  }
};

// Update a test
export const updateTest = async (testId, updateData) => {
  try {
    const testRef = doc(db, "tests", testId);
    await updateDoc(testRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

// Delete a test
export const deleteTest = async (testId) => {
  try {
    await deleteDoc(doc(db, "tests", testId));
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

// Clear all responses for a test (reset responses array and totalResponses)
export const clearTestResponses = async (testId) => {
  try {
    if (!testId) throw new Error("Invalid testId");
    const testRef = doc(db, "tests", testId);
    await updateDoc(testRef, {
      responses: [],
      totalResponses: 0,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error clearing test responses:", error);
    throw error;
  }
};

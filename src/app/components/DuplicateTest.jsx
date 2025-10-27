"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";
import toast from "react-hot-toast";
import CreateTestForm from "./CreateTestForm";

export default function DuplicateTest({ test, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDuplicate = async (formData) => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to duplicate a test!");

      const testData = {
        ...formData,
        testName: `${formData.testName} (Copy)`,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email,
        status: "inactive",
        responses: [],
        totalResponses: 0
      };

      const docRef = await addDoc(collection(db, "tests"), testData);

      toast.success(`Test "${testData.testName}" duplicated successfully! 🎉`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to duplicate test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-7xl mx-4 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Duplicate Test</h2>
        <CreateTestForm initialData={test} onSubmit={handleDuplicate} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

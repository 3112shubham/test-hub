import React from "react";
import { getTestById } from "@/lib/testOperations";

// This is a Next.js Server Component used for public test viewing.
// It fetches the test by id and renders a read-only view. Only tests
// with status === 'published' will be shown; others return notFound.

export default async function Page({ params }) {
  const { id } = params;
  try {
    const test = await getTestById(id);
    if (!test || test.status !== "published") {
      return (
        <div className="p-8 max-w-3xl mx-auto bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Test not found</h2>
          <p>This test is not published or does not exist.</p>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-3xl mx-auto bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
        <div className="text-sm text-gray-600 mb-4">
          {test.totalQuestions} questions • {test.duration} minutes
        </div>
        {test.instructions && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <pre className="whitespace-pre-wrap">{test.instructions}</pre>
          </div>
        )}

        <div className="space-y-4">
          {test.questions?.map((q, i) => (
            <div key={i} className="p-4 border rounded">
              <div className="font-medium mb-2">{i + 1}. {q.question}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="p-2 bg-gray-50 rounded">{opt}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Error loading test</h2>
        <p>{String(error)}</p>
      </div>
    );
  }
}

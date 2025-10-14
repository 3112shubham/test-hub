import React from "react";
import { getTestById } from "@/lib/testOperations";
import TestRunner from "./TestRunner";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const test = await getTestById(id);
    if (!test || test.status !== "active") {
      return (
        <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Test not found</h2>
          <p className="text-gray-600">This test is not published or does not exist.</p>
        </div>
      );
    }

    const serialized = JSON.parse(JSON.stringify(test, (k, v) => {
      if (v && typeof v === 'object') {
        if (typeof v.toDate === 'function') return v.toDate().toISOString();
        if (v.seconds && typeof v.seconds === 'number') return new Date(v.seconds * 1000).toISOString();
      }
      return v;
    }));

    return <TestRunner test={serialized} />;
  } catch (error) {
    console.error(error);
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-red-600">Error loading test</h2>
        <p className="text-gray-600">{String(error)}</p>
      </div>
    );
  }
}
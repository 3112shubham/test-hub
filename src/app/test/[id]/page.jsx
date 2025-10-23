import React from "react";
import { getTestById } from "@/lib/testOperations";
import TestRunner from "./TestRunner";
import { Loader2 } from "lucide-react";

export default async function Page({ params }) {
  const { id } = await params;

  try {
    const test = await getTestById(id);

    if (!test || test.status !== "active") {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="p-8 max-w-md w-full bg-white  rounded-2xl shadow-xl text-center border border-gray-200 ">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 ">
              Test Not Found
            </h2>
            <p className="text-gray-600 ">
              This test is either unpublished or does not exist.
            </p>
          </div>
        </div>
      );
    }

    const serialized = JSON.parse(
      JSON.stringify(test, (k, v) => {
        if (v && typeof v === "object") {
          if (typeof v.toDate === "function") return v.toDate().toISOString();
          if (v.seconds && typeof v.seconds === "number")
            return new Date(v.seconds * 1000).toISOString();
        }
        return v;
      })
    );

    return <TestRunner test={serialized} />;
  } catch (error) {
    console.error(error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="p-8 max-w-md w-full bg-white rounded-2xl shadow-xl text-center border border-rose-300 ">
          <h2 className="text-2xl font-semibold mb-2 text-rose-600 ">
            Error Loading Test
          </h2>
          <p className="text-gray-600 ">
            {error.message ||
              "An unexpected error occurred while fetching the test."}
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="/tests"
              className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white font-medium transition"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }
}

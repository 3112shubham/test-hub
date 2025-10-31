"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTestById } from "@/lib/testOperations";
import TestRunner from "./TestRunner";

export default function Page() {
  const { id } = useParams() || {};
  const router = useRouter();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTestById(id);
        if (!mounted) return;
        if (!data || data.status !== "active") {
          setTest(null);
        } else {
          // Serialize dates to ISO strings for client consumption
          const serialized = JSON.parse(
            JSON.stringify(data, (k, v) => {
              if (v && typeof v === "object") {
                if (typeof v.toDate === "function") return v.toDate().toISOString();
                if (v.seconds && typeof v.seconds === "number") return new Date(v.seconds * 1000).toISOString();
              }
              return v;
            })
          );
          setTest(serialized);
        }
      } catch (err) {
        console.error("Error fetching test:", err);
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="text-center">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-red-600">Error loading test</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Test not found</h2>
        <p className="text-gray-600">This test is not published or does not exist.</p>
      </div>
    );
  }

  return <TestRunner test={test} />;
}
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
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    let startTime = Date.now();
    let loadingTimer;

    // Update loading time every second
    const updateLoadingTime = () => {
      if (mounted) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setLoadingTime(elapsed);
        loadingTimer = setTimeout(updateLoadingTime, 1000);
      }
    };
    updateLoadingTime();

    const load = async () => {
      setLoading(true);
      try {
        // Add timeout to getTestById
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
        );
        const dataPromise = getTestById(id);
        const data = await Promise.race([dataPromise, timeoutPromise]);
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
        if (mounted) {
          setLoading(false);
          clearTimeout(loadingTimer);
        }
      }
    };

    load();
    return () => {
      mounted = false;
      clearTimeout(loadingTimer);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-2xl bg-white shadow-lg text-center max-w-md mx-4">
          <div className="animate-spin w-12 h-12 mb-4 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Loading test...</div>
          <div className="text-gray-600 mb-4">
            Time elapsed: {loadingTime} seconds
            {loadingTime >= 10 && (
              <div className="mt-2 text-sm text-amber-600">
                This is taking longer than usual. Please wait...
              </div>
            )}
            {loadingTime >= 20 && (
              <div className="mt-2 text-sm text-red-600">
                Still loading... You can try refreshing the page if this persists.
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
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
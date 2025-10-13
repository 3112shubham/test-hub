"use client";
import { useState } from "react";

export default function TestDetailsForm() {
  const [duration, setDuration] = useState("");
  const [maxMarks, setMaxMarks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { duration, maxMarks };
    localStorage.setItem("testDetails", JSON.stringify(data));
    alert("Test details saved locally!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow w-full max-w-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Test Details</h2>
      <div className="mb-3">
        <label className="block mb-1">Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Max Marks</label>
        <input
          type="number"
          value={maxMarks}
          onChange={(e) => setMaxMarks(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Save Details
      </button>
    </form>
  );
}

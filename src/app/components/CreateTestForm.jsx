"use client";
import { useState } from "react";

export default function CreateTestForm() {
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { testName, subject };
    localStorage.setItem("createTest", JSON.stringify(data));
    alert("Test created & saved locally!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow w-full max-w-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Create Test</h2>
      <div className="mb-3">
        <label className="block mb-1">Test Name</label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Save Test
      </button>
    </form>
  );
}

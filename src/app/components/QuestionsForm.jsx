"use client";
import { useState } from "react";

export default function QuestionsForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [questions, setQuestions] = useState(
    JSON.parse(localStorage.getItem("questions") || "[]")
  );

  const handleAddQuestion = (e) => {
    e.preventDefault();
    const newQuestion = { question, options, correct };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    localStorage.setItem("questions", JSON.stringify(updated));

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Add Questions</h2>
      <form onSubmit={handleAddQuestion}>
        <div className="mb-3">
          <label className="block mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {options.map((opt, i) => (
          <div key={i} className="mb-2">
            <label className="block mb-1">Option {i + 1}</label>
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="block mb-1">Correct Option (1–4)</label>
          <input
            type="number"
            min="1"
            max="4"
            value={correct + 1}
            onChange={(e) => setCorrect(Number(e.target.value) - 1)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </form>

      <h3 className="text-lg font-semibold mt-6">Saved Questions</h3>
      <ul className="mt-2 list-disc pl-6">
        {questions.map((q, idx) => (
          <li key={idx}>
            {q.question} (Correct: Option {q.correct + 1})
          </li>
        ))}
      </ul>
    </div>
  );
}

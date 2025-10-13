"use client";
import { useState, useEffect } from "react";

export default function QuestionsForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [optionCount, setOptionCount] = useState(4);

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem("questions");
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  // Update options when optionCount changes
  useEffect(() => {
    setOptions((prev) => {
      const newOptions = [...prev];

      // Add new empty options if count increased
      while (newOptions.length < optionCount) {
        newOptions.push("");
      }

      // Remove extra options if count decreased
      while (newOptions.length > optionCount) {
        newOptions.pop();
      }

      return newOptions;
    });

    // Reset correct option if it's beyond new count
    if (correctOption >= optionCount) {
      setCorrectOption(0);
    }
  }, [optionCount, correctOption]);

  const handleAddQuestion = (e) => {
    e.preventDefault();

    const newQuestion = {
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctOption,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));

    // Reset form
    setQuestion("");
    setOptions(Array(optionCount).fill(""));
    setCorrectOption(0);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));
  };

  const clearAllQuestions = () => {
    setQuestions([]);
    localStorage.removeItem("questions");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Question Manager</h2>
        <div className="text-sm text-gray-600">
          {questions.length} question{questions.length !== 1 ? "s" : ""} saved
        </div>
      </div>

      {/* Add Question Form */}
      <form
        onSubmit={handleAddQuestion}
        className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="3"
              placeholder="Enter your question here..."
              required
            />
          </div>

          {/* Option Count Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Options
            </label>
            <select
              value={optionCount}
              onChange={(e) => setOptionCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Options
                </option>
              ))}
            </select>
          </div>

          {/* Correct Answer Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Options Inputs */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      correctOption === index ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[index] = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}...`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + Add Question
          </button>
        </div>
      </form>

      {/* Saved Questions */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Saved Questions
          </h3>
          {questions.length > 0 && (
            <button
              onClick={clearAllQuestions}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No questions added yet</p>
            <p className="text-sm">Add your first question above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-800 flex-1">
                    {index + 1}. {q.question}
                  </h4>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-2 p-2 rounded ${
                        optIndex === q.correctOption
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          optIndex === q.correctOption
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {optIndex + 1}
                      </div>
                      <span
                        className={
                          optIndex === q.correctOption
                            ? "font-medium text-green-800"
                            : "text-gray-600"
                        }
                      >
                        {option}
                      </span>
                      {optIndex === q.correctOption && (
                        <span className="text-green-600 text-sm ml-auto">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

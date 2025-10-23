// components/QuestionEditor.js
"use client";

import { X } from "lucide-react";

const QuestionEditor = ({
  question,
  index,
  isNew,
  onUpdate,
  onRemove,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onToggleCorrectOption,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-medium text-gray-800">
          {isNew ? "New Question" : "Question"} {index + 1}
        </h5>
        <button
          type="button"
          onClick={onRemove}
          className="text-rose-600 hover:text-rose-800 text-sm bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => onUpdate("question", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter the question..."
        />
      </div>

      {/* Question Type */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <select
          value={question.type}
          onChange={(e) => onUpdate("type", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="mcq">Multiple Choice (Single Answer)</option>
          <option value="multiple">Multiple Choice (Multiple Answers)</option>
          <option value="truefalse">True/False</option>
          <option value="text">Text Answer</option>
        </select>
      </div>

      {/* Options for MCQ and Multiple Choice */}
      {(question.type === "mcq" || question.type === "multiple") && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options *
          </label>
          {question.options?.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <input
                type={question.type === "multiple" ? "checkbox" : "radio"}
                checked={question.correctOptions?.includes(optIndex)}
                onChange={() => onToggleCorrectOption(optIndex)}
                className="focus:ring-blue-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => onUpdateOption(optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => onRemoveOption(optIndex)}
                  className="text-rose-600 hover:text-rose-800 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddOption}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Text Answer */}
      {question.type === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Answer
          </label>
          <textarea
            value={question.textAnswer || ""}
            onChange={(e) => onUpdate("textAnswer", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the expected answer..."
          />
        </div>
      )}

      {/* True/False Answer */}
      {question.type === "truefalse" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`truefalse-${index}`}
                checked={question.trueFalseAnswer === true}
                onChange={() => onUpdate("trueFalseAnswer", true)}
                className="focus:ring-blue-500"
              />
              <span>True</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`truefalse-${index}`}
                checked={question.trueFalseAnswer === false}
                onChange={() => onUpdate("trueFalseAnswer", false)}
                className="focus:ring-blue-500"
              />
              <span>False</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;

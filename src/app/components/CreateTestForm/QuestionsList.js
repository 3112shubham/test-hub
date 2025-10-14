export default function QuestionsList({
  questions,
  deleteQuestion,
  clearAllQuestions,
}) {
  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Saved Questions ({questions.length})
        </h3>
        {questions.length > 0 && (
          <button
            type="button"
            onClick={clearAllQuestions}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">📝</div>
          <p>No questions added yet</p>
          <p className="text-sm">Add your first question above</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
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
                  type="button"
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
                      q.correctOptions && q.correctOptions.includes(optIndex)
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        q.correctOptions && q.correctOptions.includes(optIndex)
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {optIndex + 1}
                    </div>
                    <span
                      className={
                        q.correctOptions && q.correctOptions.includes(optIndex)
                          ? "font-medium text-green-800"
                          : "text-gray-600"
                      }
                    >
                      {option}
                    </span>
                    {q.correctOptions &&
                      q.correctOptions.includes(optIndex) && (
                        <span className="text-green-600 text-sm ml-auto">
                          ✓ Correct
                        </span>
                      )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {q.correctOptions && q.correctOptions.length > 1
                  ? "Multiple correct answers"
                  : "Single correct answer"}
                {q.correctOptions && q.correctOptions.length > 0 && (
                  <span>
                    {" "}
                    (Options {q.correctOptions.map((opt) => opt + 1).join(", ")}
                    )
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

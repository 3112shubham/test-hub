export default function QuestionsList({
  questions,
  deleteQuestion,
  clearAllQuestions,
}) {
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      mcq: { label: "Single Choice", color: "bg-blue-100 text-blue-800" },
      multiple: {
        label: "Multiple Correct",
        color: "bg-green-100 text-green-800",
      },
      truefalse: {
        label: "True/False",
        color: "bg-purple-100 text-purple-800",
      },
      text: { label: "Text Answer", color: "bg-orange-100 text-orange-800" },
    };

    const config = typeConfig[type] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCorrectAnswersPreview = (question) => {
    switch (question.type) {
      case "mcq":
        return `Correct: Option ${question.correctOptions[0] + 1}`;
      case "multiple":
        return `Correct: Options ${question.correctOptions
          .map((opt) => opt + 1)
          .join(", ")}`;
      case "truefalse":
        return `Correct: ${question.trueFalseAnswer ? "True" : "False"}`;
      case "text":
        return `Text Answer: ${question.textAnswer?.substring(0, 50)}${
          question.textAnswer?.length > 50 ? "..." : ""
        }`;
      default:
        return "Correct answer not set";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Added Questions ({questions.length})
        </h3>
        {questions.length > 0 && (
          <button
            onClick={clearAllQuestions}
            className="text-red-600 hover:text-red-800 text-sm font-medium py-2 px-3 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p>No questions added yet</p>
          <p className="text-sm mt-1">
            Add your first question using the form above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  {getQuestionTypeBadge(q.type)}
                </div>
                <button
                  onClick={() => deleteQuestion(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  title="Delete question"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="font-medium text-gray-800 mb-2">{q.question}</p>

              {q.type !== "text" && q.options && q.options.length > 0 && (
                <div className="space-y-1 mb-2">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-2 text-sm ${
                        q.correctOptions?.includes(optIndex)
                          ? "text-green-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="w-4 h-4 flex items-center justify-center">
                        {q.correctOptions?.includes(optIndex) ? "✓" : "○"}
                      </span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                {getCorrectAnswersPreview(q)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

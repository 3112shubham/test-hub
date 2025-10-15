export default function TestSummary({
  testName,
  domain,
  domains,
  duration,
  questions,
  questionTypeStats,
}) {
  const questionsLength = questions?.length || 0;

  // Question type labels and icons
  const questionTypeConfig = {
    mcq: { label: "Single Choice", icon: "🔘", color: "text-blue-600" },
    multiple: {
      label: "Multiple Correct",
      icon: "☑️",
      color: "text-green-600",
    },
    truefalse: { label: "True/False", icon: "🔀", color: "text-purple-600" },
    text: { label: "Text Answer", icon: "📝", color: "text-orange-600" },
  };

  // Calculate total points (simple calculation - you can customize this)
  const calculateTotalPoints = () => {
    return questionsLength * 1; // 1 point per question
  };

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-3">Test Summary</h4>

      {/* Basic Test Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <div className="text-blue-600 font-medium">Test Name</div>
          <div className="font-medium">{testName || "Not set"}</div>
        </div>
        <div>
          <div className="text-blue-600 font-medium">Domain</div>
          <div className="font-medium">
            {domains?.find((d) => d.value === domain)?.label || "Not set"}
          </div>
        </div>

        <div>
          <div className="text-blue-600 font-medium">Total Questions</div>
          <div className="font-medium">{questionsLength} questions</div>
        </div>
      </div>

      {/* Question Type Breakdown */}
      {questionsLength > 0 && (
        <div className="border-t border-blue-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-blue-700 font-medium">Question Types</h5>
            <div className="text-sm text-blue-600">
              Total Points:{" "}
              <span className="font-bold">{calculateTotalPoints()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(questionTypeStats || {}).map(([type, count]) => {
              const config = questionTypeConfig[type] || {
                label: type,
                icon: "❓",
                color: "text-gray-600",
              };
              const percentage = Math.round((count / questionsLength) * 100);

              return (
                <div
                  key={type}
                  className="bg-white rounded-lg p-3 border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{config.icon}</span>
                    <span className={`text-sm font-bold ${config.color}`}>
                      {count}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    {config.label}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        type === "mcq"
                          ? "bg-blue-500"
                          : type === "multiple"
                          ? "bg-green-500"
                          : type === "truefalse"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Question Type Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
            {Object.entries(questionTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-1">
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {questionsLength === 0 && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-lg mb-1">📝</div>
          <div>No questions added yet</div>
          <div className="text-sm">Add questions to see detailed summary</div>
        </div>
      )}
    </div>
  );
}

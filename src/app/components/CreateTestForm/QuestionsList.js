export default function QuestionsList({
  questions,
  deleteQuestion,
  clearAllQuestions,
}) {
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      mcq: { 
        label: "SC", 
        color: "bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] text-white",
        fullLabel: "Single Choice"
      },
      multiple: {
        label: "MC",
        color: "bg-gradient-to-r from-[#6BBF59] to-[#4CAF50] text-white",
        fullLabel: "Multiple Choice"
      },
      truefalse: {
        label: "TF",
        color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
        fullLabel: "True/False"
      },
      text: { 
        label: "TA", 
        color: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
        fullLabel: "Text Answer"
      },
    };

    const config = typeConfig[type] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
      fullLabel: type
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.color}`} title={config.fullLabel}>
        {config.label}
      </span>
    );
  };

  const getCorrectAnswersPreview = (question) => {
    switch (question.type) {
      case "mcq":
        return question.correctOptions?.[0] !== undefined ? `✓ ${question.correctOptions[0] + 1}` : "❌";
      case "multiple":
        return question.correctOptions?.length > 0 
          ? `✓ ${question.correctOptions.map(opt => opt + 1).join(",")}` 
          : "❌";
      case "truefalse":
        return question.trueFalseAnswer !== undefined 
          ? `✓ ${question.trueFalseAnswer ? "T" : "F"}` 
          : "❌";
      case "text":
        return question.textAnswer ? "✓ Text" : "❌";
      default:
        return "❌";
    }
  };

  // Calculate question type counts
  const questionCounts = {
    total: questions.length,
    mcq: questions.filter(q => q.type === 'mcq').length,
    multiple: questions.filter(q => q.type === 'multiple').length,
    truefalse: questions.filter(q => q.type === 'truefalse').length,
    text: questions.filter(q => q.type === 'text').length,
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 p-4 flex flex-col shadow-lg shadow-blue-500/5" style={{ height: 'calc(100vh)' }}>
      
      {/* Fixed Summary Section */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Questions</h3>
            <span className="bg-blue-100 text-[#1D4ED8] px-2 py-1 rounded-full text-sm font-bold">
              {questionCounts.total}
            </span>
          </div>
          {questions.length > 0 && (
            <button
              onClick={clearAllQuestions}
              className="text-rose-600 hover:text-rose-800 text-sm font-medium py-1 px-2 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm font-bold text-[#1D4ED8]">{questionCounts.mcq}</div>
            <div className="text-xs text-gray-600">Single</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <div className="text-sm font-bold text-[#6BBF59]">{questionCounts.multiple}</div>
            <div className="text-xs text-gray-600">Multi</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm font-bold text-purple-600">{questionCounts.truefalse}</div>
            <div className="text-xs text-gray-600">T/F</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-sm font-bold text-amber-600">{questionCounts.text}</div>
            <div className="text-xs text-gray-600">Text</div>
          </div>
        </div>
      </div>

      {/* Scrollable Questions List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-200">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm font-medium text-gray-600 mb-1">No questions yet</p>
            <p className="text-xs text-gray-500">Add questions to get started</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-2">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="border border-blue-100 rounded-lg p-3 hover:border-[#00BCD4] transition-all duration-200 bg-white hover:shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Question Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {getQuestionTypeBadge(q.type)}
                          <span className="text-xs font-medium text-gray-500">
                            {getCorrectAnswersPreview(q)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-800 font-medium leading-tight line-clamp-2">
                        {q.question}
                      </p>

                      {/* Quick Options Preview */}
                      {q.type !== "text" && q.options && q.options.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {q.options.slice(0, 3).map((option, optIndex) => (
                            <span
                              key={optIndex}
                              className={`text-xs px-1.5 py-0.5 rounded border ${
                                q.correctOptions?.includes(optIndex)
                                  ? "bg-[#6BBF59]/10 text-[#6BBF59] border-[#6BBF59]/20 font-medium"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                              title={option}
                            >
                              {optIndex + 1}
                            </span>
                          ))}
                          {q.options.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{q.options.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Delete Button */}
                    <button
                      onClick={() => deleteQuestion(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-all duration-200 flex-shrink-0"
                      title="Delete question"
                    >
                      <svg
                        className="w-3 h-3"
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
                </div>
              ))}
            </div>

            {/* Quick Summary at Bottom */}
            {questions.length > 5 && (
              <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total questions:</span>
                  <span className="font-bold text-[#1D4ED8]">{questions.length}</span>
                  <span className="text-gray-600">Types:</span>
                  <div className="flex items-center gap-1">
                    {questionCounts.mcq > 0 && <span className="text-[#1D4ED8]">{questionCounts.mcq} SC</span>}
                    {questionCounts.multiple > 0 && <span className="text-[#6BBF59]">, {questionCounts.multiple} MC</span>}
                    {questionCounts.truefalse > 0 && <span className="text-purple-600">, {questionCounts.truefalse} TF</span>}
                    {questionCounts.text > 0 && <span className="text-amber-600">, {questionCounts.text} TA</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
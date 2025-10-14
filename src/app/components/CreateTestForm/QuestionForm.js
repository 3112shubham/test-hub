export default function QuestionForm({
  question,
  setQuestion,
  options,
  setOptions,
  correctOptions = [], // Default value if undefined
  setCorrectOptions,
  handleAddQuestion,
}) {
  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);

    // Remove from correct options if present
    const newCorrectOptions = (correctOptions || [])
      .filter((optIndex) => optIndex !== index)
      .map((optIndex) => (optIndex > index ? optIndex - 1 : optIndex));
    setCorrectOptions(newCorrectOptions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectOption = (index) => {
    const currentCorrectOptions = correctOptions || [];
    const newCorrectOptions = [...currentCorrectOptions];

    if (newCorrectOptions.includes(index)) {
      // Remove from correct options
      setCorrectOptions(newCorrectOptions.filter((i) => i !== index));
    } else {
      // Add to correct options
      setCorrectOptions([...newCorrectOptions, index].sort((a, b) => a - b));
    }
  };

  const isOptionCorrect = (index) => {
    return (correctOptions || []).includes(index);
  };

  const safeCorrectOptions = correctOptions || [];

  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Add New Question
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows="3"
            placeholder="Enter your question here..."
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options * ({options.length} added)
            </label>
            <div className="text-sm text-gray-600">
              {safeCorrectOptions.length} correct option(s) selected
            </div>
          </div>

          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    isOptionCorrect(index) ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Option ${index + 1}...`}
                />
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOptionCorrect(index)}
                      onChange={() => toggleCorrectOption(index)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      Correct
                    </span>
                  </label>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove option"
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
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3">
            <p className="text-sm text-gray-500">
              Minimum 2 options required. Click &quot;Add Option&quot; to add
              more choices.
            </p>
            <button
              type="button"
              onClick={addOption}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Option
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          {options.length} options • {safeCorrectOptions.length} correct
          {safeCorrectOptions.length > 0 && (
            <span className="ml-1">
              (Option{safeCorrectOptions.length > 1 ? "s" : ""}{" "}
              {safeCorrectOptions.map((opt) => opt + 1).join(", ")})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
          disabled={
            !question ||
            options.some((opt) => !opt.trim()) ||
            options.length < 2 ||
            safeCorrectOptions.length === 0
          }
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Add Question
        </button>
      </div>
    </div>
  );
}
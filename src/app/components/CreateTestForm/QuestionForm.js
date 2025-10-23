import { useState, useEffect } from "react";

export default function QuestionForm({
  question,
  setQuestion,
  options,
  setOptions,
  correctOptions = [],
  setCorrectOptions,
  handleAddQuestion,
  // Consolidated question type props
  questionType: externalQuestionType,
  setQuestionType: externalSetQuestionType,
  textAnswer: externalTextAnswer,
  setTextAnswer: externalSetTextAnswer,
  trueFalseAnswer: externalTrueFalseAnswer,
  setTrueFalseAnswer: externalSetTrueFalseAnswer,
}) {
  // Internal state management if not controlled from parent
  const [internalQuestionType, setInternalQuestionType] = useState("mcq");
  const [internalTextAnswer, setInternalTextAnswer] = useState("");
  const [internalTrueFalseAnswer, setInternalTrueFalseAnswer] = useState(null);

  // Use external state if provided, otherwise internal
  const questionType = externalQuestionType || internalQuestionType;
  const setQuestionType = externalSetQuestionType || setInternalQuestionType;
  const textAnswer = externalTextAnswer || internalTextAnswer;
  const setTextAnswer = externalSetTextAnswer || setInternalTextAnswer;
  const trueFalseAnswer =
    externalTrueFalseAnswer !== undefined
      ? externalTrueFalseAnswer
      : internalTrueFalseAnswer;
  const setTrueFalseAnswer =
    externalSetTrueFalseAnswer || setInternalTrueFalseAnswer;

  const questionTypes = [
    { id: "mcq", name: "Single Choice", icon: "🔘" },
    { id: "multiple", name: "Multiple Correct", icon: "☑️" },
    { id: "truefalse", name: "True/False", icon: "🔀" },
    { id: "text", name: "Text Answer", icon: "📝" },
  ];

  // Initialize options based on question type
  useEffect(() => {
    switch (questionType) {
      case "truefalse":
        setOptions(["True", "False"]);
        setCorrectOptions([]);
        setTrueFalseAnswer(null);
        break;
      case "text":
        setOptions([]);
        setCorrectOptions([]);
        setTextAnswer("");
        break;
      case "mcq":
      case "multiple":
        if (
          options.length === 0 ||
          (options.length === 2 && options.every((opt) => opt === ""))
        ) {
          setOptions(["", ""]);
        }
        setCorrectOptions([]);
        break;
    }
  },[questionType]);

  const addOption = () => {
    if (questionType === "text" || questionType === "truefalse") return;
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (questionType === "text" || questionType === "truefalse") return;

    if (options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);

    // Remove from correct options if present
    const newCorrectOptions = correctOptions
      .filter((optIndex) => optIndex !== index)
      .map((optIndex) => (optIndex > index ? optIndex - 1 : optIndex));
    setCorrectOptions(newCorrectOptions);
  };

  const updateOption = (index, value) => {
    if (questionType === "text" || questionType === "truefalse") return;

    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectOption = (index) => {
    if (questionType === "text") return;

    if (questionType === "mcq") {
      // For single choice, replace the correct option
      setCorrectOptions([index]);
    } else if (questionType === "multiple") {
      // For multiple choice, toggle the option
      const newCorrectOptions = correctOptions.includes(index)
        ? correctOptions.filter((i) => i !== index)
        : [...correctOptions, index].sort((a, b) => a - b);
      setCorrectOptions(newCorrectOptions);
    } else if (questionType === "truefalse") {
      // For true/false, set the answer
      setCorrectOptions([index]);
      setTrueFalseAnswer(index === 0);
    }
  };

  const handleTextAnswerChange = (value) => {
    setTextAnswer(value);
  };

  const isOptionCorrect = (index) => {
    return correctOptions.includes(index);
  };

  const getAnswerPreview = () => {
    switch (questionType) {
      case "mcq":
        return correctOptions.length > 0
          ? `Option ${correctOptions[0] + 1}`
          : "Not set";
      case "multiple":
        return correctOptions.length > 0
          ? `Options ${correctOptions.map((opt) => opt + 1).join(", ")}`
          : "Not set";
      case "truefalse":
        return trueFalseAnswer !== null
          ? trueFalseAnswer
            ? "True"
            : "False"
          : "Not set";
      case "text":
        return textAnswer ? "Text answer set" : "Not set";
      default:
        return "Not set";
    }
  };

  const canAddQuestion = () => {
    if (!question.trim()) return false;

    switch (questionType) {
      case "mcq":
      case "multiple":
        return (
          options.length >= 2 &&
          !options.some((opt) => !opt.trim()) &&
          correctOptions.length > 0
        );
      case "truefalse":
        return correctOptions.length === 1;
      case "text":
        return textAnswer.trim().length > 0;
      default:
        return false;
    }
  };

  const handleAddQuestionWithType = () => {
    let questionData = {
      question,
      type: questionType,
      options: questionType === "text" ? [] : options,
    };

    // Add correct answers based on type
    switch (questionType) {
      case "mcq":
      case "multiple":
        questionData.correctOptions = correctOptions;
        break;
      case "truefalse":
        questionData.correctOptions = correctOptions;
        questionData.trueFalseAnswer = trueFalseAnswer;
        break;
      case "text":
        questionData.correctOptions = [];
        questionData.textAnswer = textAnswer;
        break;
    }

    handleAddQuestion(questionData);
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOptions([]);
    setTextAnswer("");
    setTrueFalseAnswer(null);
  };

  return (
    <div className="p-6 border border-gray-200 rounded-xl ">
      {/* Question Type Navigation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Question Type
        </label>
        <div className="flex space-x-1 p-1 bg-white rounded-lg border border-gray-200">
          {questionTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setQuestionType(type.id);
                resetForm();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                questionType === type.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Add New Question (
        {questionTypes.find((t) => t.id === questionType)?.name})
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

        {/* Options Section - Conditionally Rendered */}
        {(questionType === "mcq" || questionType === "multiple") && (
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options * ({options.length} added)
              </label>
              <div className="text-sm text-gray-600">
                {correctOptions.length} correct option(s) selected
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
                        type={questionType === "mcq" ? "radio" : "checkbox"}
                        name="correct-option"
                        checked={isOptionCorrect(index)}
                        onChange={() => toggleCorrectOption(index)}
                        className={`w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                          questionType === "mcq" ? "rounded-full" : "rounded"
                        }`}
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Correct
                      </span>
                    </label>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="w-10 h-10 flex items-center justify-center text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
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
                Minimum 2 options required. Click &quot;Add Option&quot; to add more
                choices.
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
        )}

        {/* True/False Section */}
        {questionType === "truefalse" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Correct Answer *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleCorrectOption(index)}
                  className={`p-4 border-2 rounded-lg text-center font-medium transition-all ${
                    isOptionCorrect(index)
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Answer Section */}
        {questionType === "text" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Answer *
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="4"
              placeholder="Enter the expected answer for this question..."
            />
            <p className="text-sm text-gray-500 mt-2">
              Students will need to type their answer to this question.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          <div>
            Type: {questionTypes.find((t) => t.id === questionType)?.name}
          </div>
          <div>Correct Answer: {getAnswerPreview()}</div>
        </div>
        <button
          type="button"
          onClick={handleAddQuestionWithType}
          disabled={!canAddQuestion()}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Add Question
        </button>
      </div>
    </div>
  );
}

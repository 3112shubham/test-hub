"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { auth } from "../../lib/firebaseConfig";

export default function CreateTestForm() {
  // Test Basic Information
  const [testName, setTestName] = useState("");
  const [domain, setDomain] = useState("");

  // Test Details
  const [duration, setDuration] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [instructions, setInstructions] = useState("");

  // Add these with your other state declarations
  const [batch, setBatch] = useState("");
  const [customFields, setCustomFields] = useState([]);

  // Questions Management
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [optionCount, setOptionCount] = useState(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic"); // "basic", "details", "questions"

  const domains = [
    {
      value: "aptitude",
      label: "Aptitude",
      description:
        "Logical reasoning, quantitative ability, and problem-solving",
    },
    {
      value: "technical",
      label: "Technical",
      description: "Programming, engineering, and technical skills",
    },
    {
      value: "soft-skills",
      label: "Soft Skills",
      description: "Communication, teamwork, and interpersonal skills",
    },
    {
      value: "domain-knowledge",
      label: "Domain Knowledge",
      description: "Industry-specific knowledge and expertise",
    },
    {
      value: "behavioral",
      label: "Behavioral",
      description: "Personality, work style, and cultural fit",
    },
    {
      value: "language",
      label: "Language",
      description: "Verbal ability and language proficiency",
    },
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedTest = localStorage.getItem("createTest");
    const savedDetails = localStorage.getItem("testDetails");
    const savedQuestions = localStorage.getItem("questions");

    if (savedTest) {
      const testData = JSON.parse(savedTest);
      setTestName(testData.testName || "");
      setDomain(testData.domain || "");
      setCustomFields(testData.customFields || []);
    }

    if (savedDetails) {
      const detailsData = JSON.parse(savedDetails);
      setDuration(detailsData.duration || "");
      setBatch(detailsData.batch || "");
      setMaxMarks(detailsData.maxMarks || "");
      setPassingMarks(detailsData.passingMarks || "");
      setInstructions(detailsData.instructions || "");
      setCustomFields(detailsData.customFields || []);
    }

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  // Update options when optionCount changes
  useEffect(() => {
    setOptions((prev) => {
      const newOptions = [...prev];
      while (newOptions.length < optionCount) newOptions.push("");
      while (newOptions.length > optionCount) newOptions.pop();
      return newOptions;
    });
    if (correctOption >= optionCount) setCorrectOption(0);
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

  const resetForm = () => {
    // Test Basic Information
    setTestName("");
    setDomain("");

    // Test Details
    setDuration("");
    setBatch("");
    setMaxMarks("");
    setPassingMarks("");
    setInstructions("");

    // Custom Fields
    setCustomFields([]);

    // Questions Management
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOption(0);
    setQuestions([]);
    setOptionCount(4);

    // Reset to first section
    setActiveSection("basic");

    // Clear localStorage
    localStorage.removeItem("createTest");
    localStorage.removeItem("testDetails");
    localStorage.removeItem("questions");
  };

  // Update your handleSubmit function - replace the reset section:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a test!");
        return;
      }

      const testData = {
        testName,
        domain,
        duration,
        batch,
        maxMarks,
        passingMarks,
        instructions,
        customFields: customFields.filter((field) => field.key && field.value),
        questions,
        totalQuestions: questions.length,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email,
        status: "active",
        responses: [],
        totalResponses: 0, // Add this field
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "tests"), testData);

      // Also save locally for immediate access
      localStorage.setItem(
        "createTest",
        JSON.stringify({
          ...testData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem(
        "testDetails",
        JSON.stringify({
          duration,
          batch,
          maxMarks,
          passingMarks,
          instructions,
          customFields,
        })
      );
      localStorage.setItem("questions", JSON.stringify(questions));

      alert(
        `Test "${testName}" created successfully! 🎉\n\nTest ID: ${docRef.id}\nTotal Questions: ${questions.length}\nDuration: ${duration} minutes\nMax Marks: ${maxMarks}`
      );

      // Reset form after successful creation
      resetForm(); // Replace the individual setters with this
    } catch (error) {
      console.error("Error saving test to Firestore:", error);
      alert("Failed to save test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDomainDescription = () => {
    const selected = domains.find((d) => d.value === domain);
    return selected
      ? selected.description
      : "Select a domain to see description";
  };

  const isFormValid = () => {
    return testName && domain && duration && maxMarks && questions.length > 0;
  };

  const getProgressPercentage = () => {
    let progress = 0;
    if (testName) progress += 20;
    if (domain) progress += 20;
    if (duration && maxMarks) progress += 20;
    if (questions.length > 0) progress += 40;
    return progress;
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-6xl mx-auto border border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Test
            </h2>
            <p className="text-gray-600">
              Complete all sections to create your assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {questions.length}
            </div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{getProgressPercentage()}% Complete</span>
          <span>
            {questions.length > 0
              ? "Ready to create!"
              : "Add questions to complete"}
          </span>
        </div>
      </div>

      {/* Progress Navigation */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        {["basic", "details", "questions"].map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeSection === section
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {section === "basic" && "📝 Basic Information"}
            {section === "details" && "⚙️ Test Details"}
            {section === "questions" && `❓ Questions (${questions.length})`}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        {activeSection === "basic" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter a descriptive test name..."
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Domain *
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a domain...</option>
                  {domains.map((domainOption) => (
                    <option key={domainOption.value} value={domainOption.value}>
                      {domainOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Description
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 min-h-[52px] flex items-center">
                  <p
                    className={`text-sm ${
                      domain ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {getDomainDescription()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Details Section */}
        {activeSection === "details" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 60"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch *
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 100"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Marks
                </label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 40"
                  min="0"
                  max={maxMarks || undefined}
                />
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Additional Information
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCustomFields([...customFields, { key: "", value: "" }])
                  }
                  className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Add Custom Field</span>
                </button>
              </div>

              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...customFields];
                          newFields[index].key = e.target.value;
                          setCustomFields(newFields);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., College, Department, Year, etc."
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value
                      </label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...customFields];
                          newFields[index].value = e.target.value;
                          setCustomFields(newFields);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter value..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFields = customFields.filter(
                          (_, i) => i !== index
                        );
                        setCustomFields(newFields);
                      }}
                      className="mt-6 text-red-600 hover:text-red-700 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {customFields.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-600">No custom fields added yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add fields like College, Department, etc.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Predefined Common Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Common Fields
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setCustomFields([
                      ...customFields,
                      { key: "College", value: "" },
                    ])
                  }
                  className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">🏫 College</div>
                  <div className="text-sm text-gray-600">
                    Add college/university name
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomFields([
                      ...customFields,
                      { key: "Department", value: "" },
                    ])
                  }
                  className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">🎓 Department</div>
                  <div className="text-sm text-gray-600">
                    Add department/branch
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomFields([
                      ...customFields,
                      { key: "Academic Year", value: "" },
                    ])
                  }
                  className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">
                    📅 Academic Year
                  </div>
                  <div className="text-sm text-gray-600">Add academic year</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomFields([
                      ...customFields,
                      { key: "Course", value: "" },
                    ])
                  }
                  className="p-3 border border-gray-200 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">📚 Course</div>
                  <div className="text-sm text-gray-600">Add course name</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Enter test instructions for candidates..."
              />
            </div>
          </div>
        )}

        {/* Questions Section */}
        {activeSection === "questions" && (
          <div className="space-y-6">
            {/* Add Question Form */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Options *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {options.map((opt, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            correctOption === index
                              ? "bg-green-500"
                              : "bg-gray-400"
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
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  + Add Question
                </button>
              </div>
            </div>

            {/* Saved Questions List */}
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
        )}

        {/* Test Summary */}
        {(activeSection === "details" || activeSection === "questions") && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Test Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-600 font-medium">Test Name</div>
                <div>{testName || "Not set"}</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Domain</div>
                <div>
                  {domains.find((d) => d.value === domain)?.label || "Not set"}
                </div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Duration</div>
                <div>{duration ? `${duration} mins` : "Not set"}</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Questions</div>
                <div>{questions.length} added</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation and Submit Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {activeSection !== "basic" && (
              <button
                type="button"
                onClick={() =>
                  setActiveSection(
                    activeSection === "details" ? "basic" : "details"
                  )
                }
                className="bg-gray-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-colors duration-200"
              >
                ← Back to{" "}
                {activeSection === "details" ? "Basic Info" : "Test Details"}
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {activeSection === "basic" && (
              <button
                type="button"
                onClick={() => setActiveSection("details")}
                className="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Continue to Details →
              </button>
            )}

            {activeSection === "details" && (
              <button
                type="button"
                onClick={() => setActiveSection("questions")}
                className="bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Continue to Questions →
              </button>
            )}

            {activeSection === "questions" && (
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="bg-green-600 text-white py-3 px-8 rounded-xl font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Test...</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>Create Test ({questions.length} questions)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

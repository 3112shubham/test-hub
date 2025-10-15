"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";
import { auth } from "../../lib/firebaseConfig";
import BasicInfoSection from "./CreateTestForm/BasicInfoSection";
import TestDetailsSection from "./CreateTestForm/TestDetailsSection";
import QuestionsSection from "./CreateTestForm/QuestionsSection";
import ProgressHeader from "./CreateTestForm/ProgressHeader";
import NavigationTabs from "./CreateTestForm/NavigationTabs";
import TestSummary from "./CreateTestForm/TestSummary";
import NavigationButtons from "./CreateTestForm/NavigationButtons";

export default function CreateTestForm() {
  // Test Basic Information
  const [testName, setTestName] = useState("");
  const [domain, setDomain] = useState("");

  // Test Details (Simplified - only instructions and custom fields)
  const [instructions, setInstructions] = useState("");
  const [customFields, setCustomFields] = useState([]);

  // Questions Management with Type Support
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("mcq"); // mcq, multiple, truefalse, text
  const [textAnswer, setTextAnswer] = useState("");
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

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
      setInstructions(detailsData.instructions || "");
      setCustomFields(detailsData.customFields || []);
    }

    if (savedQuestions) {
      const parsedQuestions = JSON.parse(savedQuestions);
      setQuestions(parsedQuestions);
    }
  }, []);

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
  }, [questionType]);

  const handleAddQuestion = (questionData = null) => {
    // If questionData is provided (from enhanced QuestionsSection), use it
    if (questionData) {
      const newQuestion = {
        ...questionData,
        id: Date.now().toString(), // Add unique ID for better management
      };

      const updatedQuestions = [...questions, newQuestion];
      setQuestions(updatedQuestions);
      localStorage.setItem("questions", JSON.stringify(updatedQuestions));

      // Reset form based on current question type
      resetQuestionForm();
      return;
    }

    // Legacy support - validate and create question from local state
    if (questionType === "text") {
      if (!textAnswer.trim()) {
        alert("Please enter the expected text answer");
        return;
      }
    } else if (questionType === "truefalse") {
      if (correctOptions.length === 0) {
        alert("Please select True or False");
        return;
      }
    } else {
      if (correctOptions.length === 0) {
        alert("Please select at least one correct option");
        return;
      }
      if (options.some((opt) => !opt.trim())) {
        alert("Please fill in all options");
        return;
      }
    }

    const newQuestion = {
      question,
      options:
        questionType === "text"
          ? []
          : options.filter((opt) => opt.trim() !== ""),
      correctOptions,
      type: questionType,
      textAnswer: questionType === "text" ? textAnswer : undefined,
      trueFalseAnswer:
        questionType === "truefalse" ? trueFalseAnswer : undefined,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));

    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOptions([]);
    setTextAnswer("");
    setTrueFalseAnswer(null);
    setQuestionType("mcq");
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
    setTestName("");
    setDomain("");
    setInstructions("");
    setCustomFields([]);
    resetQuestionForm();
    setQuestions([]);
    setActiveSection("basic");

    localStorage.removeItem("createTest");
    localStorage.removeItem("testDetails");
    localStorage.removeItem("questions");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      console.log("Form is not valid, preventing submission");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create a test!");
        return;
      }

      // Calculate question type statistics
      const questionStats = questions.reduce((stats, q) => {
        stats[q.type] = (stats[q.type] || 0) + 1;
        return stats;
      }, {});

      const testData = {
        testName,
        domain,
        instructions,
        customFields: customFields.filter(
          (field) => field.name && field.name.trim() !== ""
        ),
        questions,
        totalQuestions: questions.length,
        questionTypes: questionStats,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email,
        status: "active",
        responses: [],
        totalResponses: 0,
      };

      const docRef = await addDoc(collection(db, "tests"), testData);

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
          instructions,
          customFields,
        })
      );
      localStorage.setItem("questions", JSON.stringify(questions));

      alert(
        `Test "${testName}" created successfully! 🎉\n\nTest ID: ${
          docRef.id
        }\nTotal Questions: ${
          questions.length
        }\nQuestion Types: ${Object.entries(questionStats)
          .map(([type, count]) => `${type}: ${count}`)
          .join(", ")}`
      );

      resetForm();
    } catch (error) {
      console.error("Error saving test to Firestore:", error);
      alert("Failed to save test. Please try again.");
    } finally {
      console.log("Custom fields to be saved:", customFields);
      console.log(
        "Filtered custom fields:",
        customFields.filter((field) => field.name && field.name.trim() !== "")
      );
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const isValid = testName && domain && questions.length > 0;

    // Additional validation for questions
    const questionsValid = questions.every((q) => {
      switch (q.type) {
        case "text":
          return q.textAnswer && q.textAnswer.trim().length > 0;
        case "truefalse":
          return q.correctOptions.length === 1;
        case "mcq":
          return q.correctOptions.length === 1 && q.options.length >= 2;
        case "multiple":
          return q.correctOptions.length >= 1 && q.options.length >= 2;
        default:
          return false;
      }
    });

    return isValid && questionsValid;
  };

  const getProgressPercentage = () => {
    let progress = 0;

    // Basic Info (40%)
    if (testName) progress += 20;
    if (domain) progress += 20;

    // Questions (60%)
    if (questions.length > 0) {
      progress += Math.min(questions.length * 5, 60); // Cap at 60%
    }

    return Math.min(progress, 100);
  };

  const getQuestionTypeStats = () => {
    const stats = {
      mcq: 0,
      multiple: 0,
      truefalse: 0,
      text: 0,
    };

    questions.forEach((q) => {
      if (stats.hasOwnProperty(q.type)) {
        stats[q.type]++;
      }
    });

    return stats;
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-8xl mx-auto border border-gray-100">
      <ProgressHeader
        questionsLength={questions.length}
        progressPercentage={getProgressPercentage()}
        questionTypeStats={getQuestionTypeStats()}
      />

      <NavigationTabs
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        questionsLength={questions.length}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeSection === "basic" && (
          <BasicInfoSection
            testName={testName}
            setTestName={setTestName}
            domain={domain}
            setDomain={setDomain}
            domains={domains}
          />
        )}

        {activeSection === "details" && (
          <TestDetailsSection
            instructions={instructions}
            setInstructions={setInstructions}
            customFields={customFields}
            setCustomFields={setCustomFields}
          />
        )}

        {activeSection === "questions" && (
          <QuestionsSection
            question={question}
            setQuestion={setQuestion}
            options={options}
            setOptions={setOptions}
            correctOptions={correctOptions}
            setCorrectOptions={setCorrectOptions}
            questions={questions}
            handleAddQuestion={handleAddQuestion}
            deleteQuestion={deleteQuestion}
            clearAllQuestions={clearAllQuestions}
            // New props for question types
            questionType={questionType}
            setQuestionType={setQuestionType}
            textAnswer={textAnswer}
            setTextAnswer={setTextAnswer}
            trueFalseAnswer={trueFalseAnswer}
            setTrueFalseAnswer={setTrueFalseAnswer}
          />
        )}

        {(activeSection === "details" || activeSection === "questions") && (
          <TestSummary
            testName={testName}
            domain={domain}
            domains={domains}
            questions={questions}
            questionTypeStats={getQuestionTypeStats()}
          />
        )}

        <NavigationButtons
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isFormValid={isFormValid()}
          isSubmitting={isSubmitting}
          questionsLength={questions.length}
          resetForm={resetForm}
          hasData={
            testName ||
            domain ||
            instructions ||
            customFields.length > 0 ||
            questions.length > 0
          }
        />
      </form>
    </div>
  );
}

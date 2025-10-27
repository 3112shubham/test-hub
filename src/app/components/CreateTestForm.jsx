"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebaseConfig";
import toast from "react-hot-toast"; // ✅ Import toast

import BasicInfoSection from "./CreateTestForm/BasicInfoSection";
import TestDetailsSection from "./CreateTestForm/TestDetailsSection";
import QuestionsSection from "./CreateTestForm/QuestionsSection";
import ProgressHeader from "./CreateTestForm/ProgressHeader";
import NavigationTabs from "./CreateTestForm/NavigationTabs";
import TestSummary from "./CreateTestForm/TestSummary";
import NavigationButtons from "./CreateTestForm/NavigationButtons";

export default function CreateTestForm({ initialData = null, onSubmit, isSubmitting: externalIsSubmitting }) {
  // Basic Info
  const [testName, setTestName] = useState(initialData?.testName || "");
  const [domain, setDomain] = useState(initialData?.domain || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [password, setPassword] = useState(initialData?.password || "");

  // Test Details
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [customFields, setCustomFields] = useState(initialData?.customFields || []);

  // Questions
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("mcq");
  const [textAnswer, setTextAnswer] = useState("");
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  const domains = [
    { value: "aptitude", label: "Aptitude" },
    { value: "technical", label: "Technical" },
    { value: "soft-skills", label: "Soft Skills" },
    { value: "domain-knowledge", label: "Domain Knowledge" },
    { value: "behavioral", label: "Behavioral" },
    { value: "language", label: "Language" },
  ];

  // Load initial data or saved data
  useEffect(() => {
    if (initialData) {
      setQuestions(initialData.questions || []);
    } else {
      const savedTest = localStorage.getItem("createTest");
      const savedDetails = localStorage.getItem("testDetails");
      const savedQuestions = localStorage.getItem("questions");

      if (savedTest) {
        const testData = JSON.parse(savedTest);
        setTestName(testData.testName || "");
        setDomain(testData.domain || "");
        setDescription(testData.description || "");
      }

      if (savedDetails) {
        const detailsData = JSON.parse(savedDetails);
        setInstructions(detailsData.instructions || "");
        setCustomFields(detailsData.customFields || []);
      }

      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
      }
    }
  }, [initialData]);

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
          (options.length === 2 && options.every((o) => o === ""))
        ) {
          setOptions(["", ""]);
        }
        setCorrectOptions([]);
        break;
    }
  }, [questionType]);

  const handleAddQuestion = (questionData = null) => {
    const newQuestion = questionData
      ? { ...questionData, id: Date.now().toString() }
      : {
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

    toast.success("Question added ✅");
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

    toast.success("Question deleted 🗑️");
  };

  const resetForm = () => {
    setTestName("");
    setDomain("");
    setDescription("");
    setInstructions("");
    setCustomFields([]);
    resetQuestionForm();
    setQuestions([]);
    setActiveSection("basic");

    localStorage.removeItem("createTest");
    localStorage.removeItem("testDetails");
    localStorage.removeItem("questions");

    toast("Form reset 🧹", { icon: "♻️" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please complete all required fields before submitting!");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in!");
      return;
    }

    setIsSubmitting(true);
    try {
      const questionStats = questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {});

      const testData = {
        testName,
        domain,
        description,
        instructions,
        password,
        customFields: customFields.filter(
          (f) => f.name && f.name.trim() !== ""
        ),
        questions,
        totalQuestions: questions.length,
        questionTypes: questionStats
      };

      if (onSubmit) {
        await onSubmit(testData);
      } else {
        const docRef = await addDoc(collection(db, "tests"), {
          ...testData,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          createdByEmail: user.email,
          status: "inactive",
          responses: [],
          totalResponses: 0,
        });

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
          JSON.stringify({ instructions, customFields })
        );
        localStorage.setItem("questions", JSON.stringify(questions));

        toast.success(`Test "${testName}" created successfully! 🎉`);
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const basicValid = testName && domain && questions.length > 0;
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
    return basicValid && questionsValid;
  };

  const getProgressPercentage = () => {
    let progress = 0;
    if (testName) progress += 40;
    if (questions.length > 0) progress += Math.min(questions.length * 20, 60);
    return Math.min(progress, 100);
  };

  const getQuestionTypeStats = () => {
    const stats = { mcq: 0, multiple: 0, truefalse: 0, text: 0 };
    questions.forEach((q) => stats[q.type] !== undefined && stats[q.type]++);
    return stats;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-8xl mx-auto border border-gray-100 h-full flex flex-col">
      <div className="px-8 pt-8 bg-white">
        <ProgressHeader
          questionsLength={questions.length}
          progressPercentage={getProgressPercentage()}
          questionTypeStats={getQuestionTypeStats()}
          testName={testName}
        />

          <NavigationTabs
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            questionsLength={questions.length}
          />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 px-8 pb-8 overflow-y-auto">
        {activeSection === "basic" && (
          <BasicInfoSection
            testName={testName}
            setTestName={setTestName}
            domain={domain}
            setDomain={setDomain}
            description={description}
            setDescription={setDescription}
            domains={domains}
            password={password}
            setPassword={setPassword}
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
            clearAllQuestions={() => {
              setQuestions([]);
              localStorage.removeItem("questions");
              toast("All questions cleared ⚠️");
            }}
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
            description={description}
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

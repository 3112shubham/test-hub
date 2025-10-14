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

  // Questions Management
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [questions, setQuestions] = useState([]);

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
      // Convert old format to new format if needed
      const updatedQuestions = parsedQuestions.map((q) => {
        if (q.correctOption !== undefined && q.correctOptions === undefined) {
          // Convert from single correct option to multiple
          return {
            ...q,
            correctOptions: [q.correctOption],
            correctOption: undefined, // Remove old field
          };
        }
        return q;
      });
      setQuestions(updatedQuestions);
    }
  }, []);

  const handleAddQuestion = (e) => {
    e.preventDefault();

    // Validate
    if (correctOptions.length === 0) {
      alert("Please select at least one correct option");
      return;
    }

    const newQuestion = {
      question,
      options: options.filter((opt) => opt.trim() !== ""),
      correctOptions,
      type: correctOptions.length > 1 ? "multiple" : "single",
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem("questions", JSON.stringify(updatedQuestions));

    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOptions([]);
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
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOptions([]);
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

      const testData = {
        testName,
        domain,
        instructions,
        customFields: customFields.filter(
          (field) => field.name && field.name.trim() !== ""
        ),
        questions,
        totalQuestions: questions.length,
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
        `Test "${testName}" created successfully! 🎉\n\nTest ID: ${docRef.id}\nTotal Questions: ${questions.length}`
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
    return isValid;
  };

  const getProgressPercentage = () => {
    let progress = 0;

    // Basic Info (50%)
    if (testName) progress += 25;
    if (domain) progress += 25;

    // Questions (50%)
    if (questions.length > 0) progress += 50;

    return Math.min(progress, 100);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-8xl mx-auto border border-gray-100">
      <ProgressHeader
        questionsLength={questions.length}
        progressPercentage={getProgressPercentage()}
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
          />
        )}

        {(activeSection === "details" || activeSection === "questions") && (
          <TestSummary
            testName={testName}
            domain={domain}
            domains={domains}
            questionsLength={questions.length}
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

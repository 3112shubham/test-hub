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

  // Test Details
  const [duration, setDuration] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [instructions, setInstructions] = useState("");
  const [batch, setBatch] = useState("");
  const [customFields, setCustomFields] = useState([]);

  // Questions Management
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [optionCount, setOptionCount] = useState(4);

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
    setTestName("");
    setDomain("");
    setDuration("");
    setBatch("");
    setMaxMarks("");
    setPassingMarks("");
    setInstructions("");
    setCustomFields([]);
    setQuestion("");
    setOptions(["", ""]);
    setCorrectOption(0);
    setQuestions([]);
    setOptionCount(4);
    setActiveSection("basic");

    localStorage.removeItem("createTest");
    localStorage.removeItem("testDetails");
    localStorage.removeItem("questions");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      resetForm();
    } catch (error) {
      console.error("Error saving test to Firestore:", error);
      alert("Failed to save test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            duration={duration}
            setDuration={setDuration}
            batch={batch}
            setBatch={setBatch}
            maxMarks={maxMarks}
            setMaxMarks={setMaxMarks}
            passingMarks={passingMarks}
            setPassingMarks={setPassingMarks}
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
            correctOption={correctOption}
            setCorrectOption={setCorrectOption}
            optionCount={optionCount}
            setOptionCount={setOptionCount}
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
            duration={duration}
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
          hasData={testName || domain || duration || questions.length > 0}
        />
      </form>
    </div>
  );
}

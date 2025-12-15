"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle,
  Menu,
  X,
  Send,
  Loader2,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";

export default function TestInterface({
  test,
  questions,
  step,
  setStep,
  answers,
  setAnswers,
  visitedQuestions,
  setVisitedQuestions,
  markedQuestions,
  setMarkedQuestions,
  customFields,
  onTestComplete,
  onReset,
}) {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [questionIndexMap, setQuestionIndexMap] = useState({});

  // Use the same storage prefix as TestRunner so we read the same saved
  // customResponses for this test. Falls back to 'global' when id is absent.
  const storagePrefix =
    typeof window !== "undefined"
      ? `testRunner_${test?.id || test?._id || "global"}`
      : "testRunner_global";

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle questions on component mount - each user gets unique but consistent shuffle
  useEffect(() => {
    if (questions && questions.length > 0) {
      const testId = test?.id || test?._id || "global";
      const storageKey = `shuffleOrder_${testId}`;
      
      let shuffleOrder = null;
      try {
        const stored = localStorage.getItem(storageKey);
        shuffleOrder = stored ? JSON.parse(stored) : null;
      } catch (e) {
        // ignore
      }

      let shuffled, indexMap;

      if (shuffleOrder && shuffleOrder.length === questions.length) {
        // Use stored shuffle order (same for this user's session)
        shuffled = shuffleOrder.map(idx => questions[idx]);
        indexMap = {};
        shuffleOrder.forEach((originalIdx, shuffledIdx) => {
          indexMap[shuffledIdx] = originalIdx;
        });
      } else {
        // Create new random shuffle (different for each user)
        shuffled = shuffleArray(questions);
        
        // Create a mapping from shuffled index to original index
        indexMap = {};
        shuffled.forEach((question, shuffledIdx) => {
          const originalIdx = questions.findIndex(
            (q) => q.question === question.question && q.type === question.type
          );
          indexMap[shuffledIdx] = originalIdx;
        });

        // Store the shuffle order for this user's session
        const shuffleOrder = Object.values(indexMap);
        try {
          localStorage.setItem(storageKey, JSON.stringify(shuffleOrder));
        } catch (e) {
          console.warn("Failed to store shuffle order", e);
        }
      }

      setShuffledQuestions(shuffled);
      setQuestionIndexMap(indexMap);
    }
  }, [questions, test.id, test._id]);

  // Close sidebar when step changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [step]);

  // check if this test was already submitted by this user on this browser
  useEffect(() => {
    try {
      const s = localStorage.getItem(`test_submitted_${test.id}`);
      if (s) {
        const parsed = JSON.parse(s);
        setSubmitted(true);
        setSubmittedAt(parsed.submittedAt || null);
      }
    } catch (e) {
      // ignore
    }
  }, [test.id]);

  // Mark question as visited when step changes
  useEffect(() => {
    if (step >= 0) {
      setVisitedQuestions((prev) => new Set([...prev, step]));
    }
  }, [step]);

  const handleAnswer = (qIndex, value, questionType) => {
    setAnswers((prev) => {
      const next = [...prev];
      switch (questionType) {
        case "multiple":
            // ensure currentAnswers is an array (defensive: localStorage may have corrupted types)
            const currentAnswers = Array.isArray(next[qIndex]) ? next[qIndex] : [];
            if (currentAnswers.includes(value)) {
              next[qIndex] = currentAnswers.filter((item) => item !== value);
            } else {
              next[qIndex] = [...currentAnswers, value];
            }
          break;
        case "text":
          next[qIndex] = value;
          break;
        case "truefalse":
          next[qIndex] = value;
          break;
        default: // mcq
          next[qIndex] = value;
          break;
      }
      return next;
    });
  };

  const toggleMarkQuestion = (qIndex) => {
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qIndex)) {
        newSet.delete(qIndex);
      } else {
        newSet.add(qIndex);
      }
      return newSet;
    });
  };

  const next = () => {
    if (step < questions.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step === 0 && customFields.length > 0) setStep(-1);
    else if (step > 0) setStep(step - 1);
  };

  const buildResponsesArray = () => {
    const customArr = Object.entries(
      JSON.parse(localStorage.getItem(`${storagePrefix}_customResponses`) || "{}")
    ).map(([key, value]) => ({ key, value }));

    const answersArr = answers.map((ans, i) => ({
      questionIndex: i,
      answer: ans,
      // defensive: questions[i] may be undefined if saved answers are out of sync
      questionType: questions?.[i]?.type ?? null,
    }));

    return [{ customArr, answersArr, meta: { testName: test.testName } }];
  };

  const handleSubmit = async () => {
    // show loader / overlay immediately
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        testId: test.id?.toString(),
        response: buildResponsesArray(),
        meta: {
          testName: test.testName || null,
          totalQuestions: displayQuestions.length,
        },
        status: "active",
        submittedAt: new Date(),
      };

      const res = await fetch("/api/test-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      // persist submission locally so returning users see the submitted state
      const stored = {
        submittedAt: new Date().toISOString(),
        payload,
      };
      try {
        localStorage.setItem(`test_submitted_${test.id}`, JSON.stringify(stored));
      } catch (e) {
        console.warn("Failed to persist submission locally", e);
      }

      setShowSuccessAlert(true);
      setMessage("Test submitted successfully!");
      setSubmitted(true);
      setSubmittedAt(stored.submittedAt);
      // keep loader briefly to show transition, then hide
      setTimeout(() => {
        setShowSuccessAlert(false);
        setMessage("");
        setLoading(false);
      }, 1200);
      // NOTE: we do NOT call onTestComplete automatically because we want
      // to preserve the stored submission locally and show the submitted UI.
      // The parent can still call onTestComplete if it wants to clear state.
    } catch (err) {
      console.error("Submission error:", err);
      setMessage("Failed to submit. Try again.");
      setLoading(false);
    }
  };

  const getQuestionStatus = (shuffledQIndex) => {
    // Map from shuffled index to original index
    const originalQIndex = questionIndexMap[shuffledQIndex] !== undefined ? questionIndexMap[shuffledQIndex] : shuffledQIndex;
    const answer = answers[originalQIndex];
    const question = displayQuestions[shuffledQIndex];
    const isVisited = visitedQuestions.has(shuffledQIndex);
    const isMarked = markedQuestions.has(shuffledQIndex);

    if (isMarked) return "marked";
    if (!isVisited) return "not-visited";
    if (answer === null || answer === undefined) return "visited";
    if (question.type === "multiple" && answer.length === 0) return "visited";
    if (question.type === "text" && answer.trim() === "") return "visited";
    return "answered";
  };

  const renderQuestion = (question, shuffledQIndex, isSingleView = true) => {
    // Map from shuffled index to original index for answer storage
    const originalQIndex = questionIndexMap[shuffledQIndex] !== undefined ? questionIndexMap[shuffledQIndex] : shuffledQIndex;
    const currentAnswer = answers[originalQIndex];
    const questionNumber = isSingleView ? step + 1 : shuffledQIndex + 1;
    const isMarked = markedQuestions.has(shuffledQIndex);

    return (
      <div
        key={shuffledQIndex}
        className={`p-4 lg:p-6 border-2 rounded-xl bg-white transition-all duration-200 ${
          isMarked
            ? "border-purple-600 bg-[#6BBF59]/5 shadow-md"
            : "border-blue-100 hover:border-blue-300"
        } ${!isSingleView ? "hover:shadow-lg" : ""}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#1D4ED8] to-[#00BCD4] text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
              {questionNumber}
            </span>
            <h4 className="text-lg font-semibold text-gray-800 leading-relaxed">
              {question.question}
            </h4>
          </div>
          <button
            onClick={() => toggleMarkQuestion(shuffledQIndex)}
            className={`flex-shrink-0 ml-4 p-2 rounded-lg transition-colors ${
              isMarked
                ? "bg-purple-100 text-purple-500 hover:bg-purple-300"
                : "bg-blue-100 text-blue-400 hover:bg-blue-200 hover:text-blue-600"
            }`}
            title={isMarked ? "Unmark question" : "Mark for review"}
          >
            <Star className={`w-5 h-5 ${isMarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Multiple Choice (Single Select) */}
        {question.type === "mcq" && (
          <div className="grid grid-cols-1 gap-3 ml-0 lg:ml-11">
            {question.options.map((opt, oi) => {
              const selected = currentAnswer === oi;
              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(originalQIndex, oi, "mcq")}
                  className={`text-left p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 group ${
                    selected
                      ? "border-[#1D4ED8] bg-gradient-to-r from-[#1D4ED8]/10 to-[#00BCD4]/5 text-[#1D4ED8] shadow-sm"
                      : "border-blue-100 bg-white text-gray-700 hover:border-[#00BCD4] hover:bg-blue-25 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                        selected
                          ? "border-[#1D4ED8] bg-[#1D4ED8] shadow-inner"
                          : "border-blue-300 group-hover:border-[#00BCD4]"
                      }`}
                    >
                      {selected && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-800 text-sm lg:text-base">
                      {opt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Multiple Correct Answers */}
        {question.type === "multiple" && (
          <div className="grid grid-cols-1 gap-3 ml-0 lg:ml-11">
            {question.options.map((opt, oi) => {
              const selected = Array.isArray(currentAnswer) ? currentAnswer.includes(oi) : false;
              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(originalQIndex, oi, "multiple")}
                  className={`text-left p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 group ${
                    selected
                      ? "border-[#6BBF59] bg-gradient-to-r from-[#6BBF59]/10 to-[#6BBF59]/5 text-[#6BBF59] shadow-sm"
                      : "border-blue-100 bg-white text-gray-700 hover:border-[#00BCD4] hover:bg-blue-25 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                        selected
                          ? "border-[#6BBF59] bg-[#6BBF59] shadow-inner"
                          : "border-blue-300 group-hover:border-[#00BCD4]"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium text-gray-800 text-sm lg:text-base">
                      {opt}
                    </span>
                  </div>
                </button>
              );
            })}
            <div className="text-sm text-[#6BBF59] mt-2 font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Select all that apply
            </div>
          </div>
        )}

        {/* True/False */}
        {question.type === "truefalse" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 ml-0 lg:ml-11">
            {["True", "False"].map((option, oi) => {
              const selected = currentAnswer === oi;
              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(originalQIndex, oi, "truefalse")}
                  className={`p-4 lg:p-6 rounded-xl border-2 text-center font-medium transition-all duration-200 group ${
                    selected
                      ? "border-[#00BCD4] bg-gradient-to-r from-[#00BCD4]/10 to-[#00BCD4]/5 text-[#00BCD4] shadow-sm"
                      : "border-blue-100 bg-white text-gray-700 hover:border-[#00BCD4] hover:bg-blue-25 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                        selected
                          ? "border-[#00BCD4] bg-[#00BCD4] shadow-inner"
                          : "border-blue-300 group-hover:border-[#00BCD4]"
                      }`}
                    >
                      {selected && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <span className="text-base lg:text-lg font-semibold">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Text Answer */}
        {question.type === "text" && (
          <div className="ml-0 lg:ml-11">
            <textarea
              value={currentAnswer || ""}
              onChange={(e) => handleAnswer(originalQIndex, e.target.value, "text")}
              className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-all duration-200 resize-vertical bg-white hover:border-[#00BCD4] focus:bg-blue-25"
              rows={4}
              placeholder="Type your detailed answer here..."
            />
            <div className="text-sm text-[#00BCD4] mt-2 font-medium">
              📝 Please provide a detailed answer
            </div>
          </div>
        )}

        {/* Question Type Badge */}
        <div className="ml-0 lg:ml-11 mt-4 flex items-center space-x-3 flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
              question.type === "mcq"
                ? "bg-[#1D4ED8]/10 text-[#1D4ED8] border border-[#1D4ED8]/20"
                : question.type === "multiple"
                ? "bg-[#6BBF59]/10 text-[#6BBF59] border border-[#6BBF59]/20"
                : question.type === "truefalse"
                ? "bg-[#00BCD4]/10 text-[#00BCD4] border border-[#00BCD4]/20"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {question.type === "mcq" && "🔘 Single Choice"}
            {question.type === "multiple" && "☑️ Multiple Choice"}
            {question.type === "truefalse" && "🔀 True/False"}
            {question.type === "text" && "📝 Text Answer"}
          </span>
          {isMarked && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600 border border-purple-400 shadow-sm">
              <Star className="w-3 h-3 fill-current mr-1" />
              Marked for Review
            </span>
          )}
        </div>
      </div>
    );
  };

  const progress = ((step + 1) / shuffledQuestions.length) * 100;
  const displayQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : questions;

  return (
    <>
      {/* Global overlay shown while submitting */}
      {loading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="p-6 rounded-xl bg-white/90 shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-[#1D4ED8]" />
            <div className="text-lg font-semibold">Submitting your test…</div>
            <div className="text-sm text-gray-600">Please wait while we save your responses.</div>
          </div>
        </div>
      )}

      {/* If already submitted, show a dedicated submitted screen */}
      {submitted && !loading && (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-lg text-center">
            <CheckCircle className="mx-auto text-[#6BBF59] w-12 h-12" />
            <h2 className="text-2xl font-bold mt-4">Test Submitted</h2>
            <p className="text-gray-600 mt-2">Your responses were submitted successfully.</p>
            {submittedAt && (
              <p className="text-sm text-gray-500 mt-2">Submitted at: {new Date(submittedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      {step >= 0 && !submitted && (
        <div
          className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-blue-100 shadow-sm flex flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
<div className="p-4 pb-3 border-b border-blue-200 bg-gradient-to-r from-[#00B5E2] to-[#2563EB]">
  <div className="flex items-center justify-between">

    {/* Logo */}
    <Image 
      src="/icon1.png"
      alt="Logo"
      width={120}
      height={120}
      className="hidden lg:block object-contain mb-4"
    />

    {/* Title */}
    <div className="ml-3">
      <h2 className="text-xl font-semibold text-white leading-tight">
        {test.testName}
      </h2>
      <p className="text-white/80 text-sm">Question Navigator</p>
    </div>

    {/* Close button (only on mobile) */}
    <button
      onClick={() => setSidebarOpen(false)}
      className="lg:hidden text-white p-2 rounded-lg hover:bg-white/20 transition"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
</div>


          {/* Progress Section */}
          <div className="p-4 border-b border-blue-100 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question
              </span>
              <span className="text-sm font-bold text-[#1D4ED8]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>
                {step + 1} of {displayQuestions.length}
              </span>
              <span>{displayQuestions.length - (step + 1)} left</span>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Questions
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {displayQuestions.map((_, qIndex) => {
                  const status = getQuestionStatus(qIndex);
                  const isCurrent = qIndex === step;

                  const statusConfig = {
                    answered: {
                      bg: "bg-[#6BBF59]",
                      border: "border-[#6BBF59]",
                      text: "text-white",
                    },
                    visited: {
                      bg: "bg-red-600",
                      border: "border-red-600",
                      text: "text-white",
                    },
                    "not-visited": {
                      bg: "bg-gray-300",
                      border: "border-gray-300",
                      text: "text-gray-800",
                    },
                    marked: {
                      bg: "bg-purple-500",
                      border: "border-purple-500",
                      text: "text-white",
                    },
                  };

                  const ringByStatus = {
                    answered: "ring-blue-400",
                    visited: "ring-blue-400",
                    "not-visited": "ring-blue-400",
                    marked: "ring-blue-400",
                  };

                  const config = statusConfig[status] || statusConfig["not-visited"];
                  const ringClass = isCurrent ? `${ringByStatus[status] || "ring-gray-400"} ring-2 ring-offset-2 transform scale-110` : "";

                  return (
                    <button
                      key={qIndex}
                      onClick={() => {
                        setStep(qIndex);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${config.bg} ${config.border} ${config.text} ${ringClass}`}
                      title={`Question ${qIndex + 1} - ${status.replace("-", " ")}`}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Status Legend
              </h4>
              <div className="space-y-2">
                {[
                  { color: "bg-[#6BBF59] border-[#6BBF59]", label: "Answered" },
                  { color: "bg-red-600 border-red-600", label: "Visited" },
                  { color: "bg-gray-300 border-gray-300", label: "Not Visited" },
                  { color: "bg-purple-500 border-purple-500", label: "Marked" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 ${item.color} rounded border`}
                    ></div>
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-100 bg-white">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6BBF59] to-[#00BCD4] hover:from-[#6BBF59]/90 hover:to-[#00BCD4]/90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {step >= 0 && !submitted && (
          <div className="lg:hidden bg-white border-b border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <Menu className="w-6 h-6 text-[#1D4ED8]" />
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-lg font-bold text-gray-800 truncate">
                  {test.testName}
                </h2>
                <p className="text-sm text-gray-600">
                  Question {step + 1} of {displayQuestions.length}
                </p>
              </div>
              <div className="flex items-center justify-center w-19">
                <Image 
                  src="/icon.png"
                  alt="Logo"
                  width={65}
                  height={65}
                />
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">
                  Question
                </span>
                <span className="text-xs font-bold text-[#1D4ED8]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="m-4 p-4 bg-[#6BBF59]/10 border border-[#6BBF59]/20 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-[#6BBF59]" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#6BBF59]">
                  Test Submitted Successfully!
                </h3>
                <p className="text-sm text-[#6BBF59] mt-1">
                  Thank you for completing the test.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="max-w-8xl mx-auto p-4 lg:p-6">
            {showAllQuestions ? (
              // All Questions View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    All Questions
                  </h3>
                  <button
                    onClick={() => setShowAllQuestions(false)}
                    className="text-[#1D4ED8] hover:text-[#00BCD4] font-medium flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Single View</span>
                  </button>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  {displayQuestions.map((question, qIndex) =>
                    renderQuestion(question, qIndex, false)
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-blue-100">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#6BBF59] to-[#00BCD4] hover:from-[#6BBF59]/90 hover:to-[#00BCD4]/90 text-white px-6 lg:px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Single Question View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Question {step + 1} of {displayQuestions.length}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAllQuestions(true)}
                      className="text-[#1D4ED8] hover:text-[#00BCD4] font-medium flex items-center space-x-2"
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <span className="hidden sm:inline">
                        View All Questions
                      </span>
                    </button>
                  </div>
                </div>

                {renderQuestion(displayQuestions[step], step, true)}

                <div className="flex justify-between items-center pt-6 border-t border-blue-100 gap-3">
                  <button
                    onClick={prev}
                    disabled={step === 0 && customFields.length === 0}
                    className="px-4 lg:px-6 py-3 border-2 border-blue-100 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-to-r from-[#6BBF59] to-[#00BCD4] hover:from-[#6BBF59]/90 hover:to-[#00BCD4]/90 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 text-white" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Test</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={next}
                      disabled={step === displayQuestions.length - 1}
                      className="bg-gradient-to-r from-[#1D4ED8] to-[#00BCD4] hover:from-[#1D4ED8]/90 hover:to-[#00BCD4]/90 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span className="hidden sm:inline">Next Question</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-xl border-2 ${
                  message.includes("successfully")
                    ? "bg-[#6BBF59]/10 text-[#6BBF59] border-[#6BBF59]/20"
                    : "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/20"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
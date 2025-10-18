"use client";
import React, { useState, useEffect } from "react";

export default function TestRunner({ test }) {
  const customFields = test.customFields || [];
  const questions = test.questions || [];

  const [step, setStep] = useState(customFields.length > 0 ? -1 : 0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [customResponses, setCustomResponses] = useState(() => {
    const init = {};
    customFields.forEach((f) => {
      init[f.id || f.name || f.key || f.name] = "";
    });
    return init;
  });

  const [answers, setAnswers] = useState(() => 
    questions.map(q => {
      if (q.type === "multiple") return [];
      if (q.type === "text") return "";
      return null;
    })
  );
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Mark question as visited when step changes
  useEffect(() => {
    if (step >= 0) {
      setVisitedQuestions(prev => new Set([...prev, step]));
    }
  }, [step]);

  const setCustomValue = (id, value) => {
    setCustomResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleAnswer = (qIndex, value, questionType) => {
    setAnswers((prev) => {
      const next = [...prev];
      
      switch (questionType) {
        case "multiple":
          const currentAnswers = next[qIndex] || [];
          if (currentAnswers.includes(value)) {
            next[qIndex] = currentAnswers.filter(item => item !== value);
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
    setMarkedQuestions(prev => {
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
    if (step === -1) setStep(0);
    else if (step < questions.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step === 0 && customFields.length > 0) setStep(-1);
    else if (step > 0) setStep(step - 1);
  };

  const buildResponsesArray = () => {
    const customArr = Object.entries(customResponses).map(([key, value]) => ({ key, value }));
    const answersArr = answers.map((ans, i) => ({ 
      questionIndex: i, 
      answer: ans,
      questionType: questions[i].type 
    }));

    return [{ customArr, answersArr, meta: { testName: test.testName } }];
  };

  const resetForm = () => {
    setStep(customFields.length > 0 ? -1 : 0);
    setAnswers(questions.map(q => {
      if (q.type === "multiple") return [];
      if (q.type === "text") return "";
      return null;
    }));
    setCustomResponses(() => {
      const init = {};
      customFields.forEach((f) => {
        init[f.id || f.name || f.key || f.name] = "";
      });
      return init;
    });
    setVisitedQuestions(new Set());
    setMarkedQuestions(new Set());
    setShowAllQuestions(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const responseData = buildResponsesArray();

      const payload = {
        testId: test.id?.toString(),
        response: buildResponsesArray(),
        meta: { testName: test.testName || null, totalQuestions: questions.length },
        status: "active",
        submittedAt: new Date()
      };

      const res = await fetch("/api/test-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Submission failed");

      setShowSuccessAlert(true);
      setMessage("Test submitted successfully!");

      setTimeout(() => {
        resetForm();
        setShowSuccessAlert(false);
        setMessage("");
      }, 2000);

    } catch (err) {
      console.error("Submission error:", err);
      setMessage("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get question status for sidebar
  const getQuestionStatus = (qIndex) => {
    const answer = answers[qIndex];
    const question = questions[qIndex];
    const isVisited = visitedQuestions.has(qIndex);
    const isMarked = markedQuestions.has(qIndex);

    if (isMarked) return 'marked';
    
    if (!isVisited) return 'not-visited';

    if (answer === null || answer === undefined) return 'visited';
    
    if (question.type === "multiple" && answer.length === 0) return 'visited';
    if (question.type === "text" && answer.trim() === "") return 'visited';

    return 'answered';
  };

  // Render question based on type
  const renderQuestion = (question, qIndex, isSingleView = true) => {
    const currentAnswer = answers[qIndex];
    const questionNumber = isSingleView ? step + 1 : qIndex + 1;
    const isMarked = markedQuestions.has(qIndex);

    return (
      <div key={qIndex} className={`p-6 border-2 rounded-xl bg-white transition-all duration-200 ${
        isMarked 
          ? 'border-yellow-400 bg-yellow-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      } ${!isSingleView ? 'hover:shadow-lg' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
              {questionNumber}
            </span>
            <h4 className="text-lg font-semibold text-gray-800 leading-relaxed">{question.question}</h4>
          </div>
          <button
            onClick={() => toggleMarkQuestion(qIndex)}
            className={`flex-shrink-0 ml-4 p-2 rounded-lg transition-colors ${
              isMarked 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title={isMarked ? "Unmark question" : "Mark for review"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>
        </div>

        {/* Multiple Choice (Single Select) */}
        {question.type === "mcq" && (
          <div className="grid grid-cols-1 gap-3 ml-11">
            {question.options.map((opt, oi) => {
              const selected = currentAnswer === oi;
              return (
                <button 
                  key={oi}
                  onClick={() => handleAnswer(qIndex, oi, "mcq")}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                    selected 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 text-blue-800 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                      selected ? 'border-blue-500 bg-blue-500 shadow-inner' : 'border-gray-400 group-hover:border-blue-400'
                    }`}>
                      {selected && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Multiple Correct Answers */}
        {question.type === "multiple" && (
          <div className="grid grid-cols-1 gap-3 ml-11">
            {question.options.map((opt, oi) => {
              const selected = currentAnswer?.includes(oi);
              return (
                <button 
                  key={oi}
                  onClick={() => handleAnswer(qIndex, oi, "multiple")}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                    selected 
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-25 text-green-800 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-25 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                      selected ? 'border-green-500 bg-green-500 shadow-inner' : 'border-gray-400 group-hover:border-green-400'
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">{opt}</span>
                  </div>
                </button>
              );
            })}
            <div className="text-sm text-green-600 mt-2 font-medium">
              ✓ Select all that apply
            </div>
          </div>
        )}

        {/* True/False */}
        {question.type === "truefalse" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
            {["True", "False"].map((option, oi) => {
              const selected = currentAnswer === oi;
              return (
                <button 
                  key={oi}
                  onClick={() => handleAnswer(qIndex, oi, "truefalse")}
                  className={`p-6 rounded-xl border-2 text-center font-medium transition-all duration-200 group ${
                    selected 
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-25 text-purple-800 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                      selected ? 'border-purple-500 bg-purple-500 shadow-inner' : 'border-gray-400 group-hover:border-purple-400'
                    }`}>
                      {selected && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <span className="text-lg font-semibold">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Text Answer */}
        {question.type === "text" && (
          <div className="ml-11">
            <textarea
              value={currentAnswer || ""}
              onChange={(e) => handleAnswer(qIndex, e.target.value, "text")}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-vertical bg-white hover:border-orange-300 focus:bg-orange-25"
              rows={4}
              placeholder="Type your detailed answer here..."
            />
            <div className="text-sm text-orange-600 mt-2 font-medium">
              📝 Please provide a detailed answer
            </div>
          </div>
        )}

        {/* Question Type Badge */}
        <div className="ml-11 mt-4 flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
            question.type === "mcq" ? "bg-blue-100 text-blue-800 border border-blue-200" :
            question.type === "multiple" ? "bg-green-100 text-green-800 border border-green-200" :
            question.type === "truefalse" ? "bg-purple-100 text-purple-800 border border-purple-200" :
            "bg-orange-100 text-orange-800 border border-orange-200"
          }`}>
            {question.type === "mcq" && "🔘 Single Choice"}
            {question.type === "multiple" && "☑️ Multiple Choice"}
            {question.type === "truefalse" && "🔀 True/False"}
            {question.type === "text" && "📝 Text Answer"}
          </span>
          {isMarked && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
              ⭐ Marked for Review
            </span>
          )}
        </div>
      </div>
    );
  };

  const progress = ((step + 1) / questions.length) * 100;

  if (!test) return <div className="p-4">Test not found</div>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar Navigation */}
      {step >= 0 && (
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-lg font-bold text-white truncate">{test.testName}</h2>
            <p className="text-blue-100 text-sm mt-1">Question Navigator</p>
          </div>

          {/* Progress Section */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{step + 1} of {questions.length}</span>
              <span>{questions.length - (step + 1)} left</span>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-3">
                {questions.map((_, qIndex) => {
                  const status = getQuestionStatus(qIndex);
                  const isCurrent = qIndex === step;
                  
                  const statusConfig = {
                    'answered': { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' },
                    'visited': { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white' },
                    'not-visited': { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' },
                    'marked': { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' }
                  };

                  const config = statusConfig[status] || statusConfig['not-visited'];

                  return (
                    <button
                      key={qIndex}
                      onClick={() => setStep(qIndex)}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${
                        config.bg
                      } ${config.border} ${config.text} ${
                        isCurrent ? 'ring-2 ring-offset-2 ring-blue-400 transform scale-110' : ''
                      }`}
                      title={`Question ${qIndex + 1} - ${status.replace('-', ' ')}`}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Status Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
                  <span className="text-xs text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
                  <span className="text-xs text-gray-600">Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border border-blue-600"></div>
                  <span className="text-xs text-gray-600">Not Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded border border-purple-600"></div>
                  <span className="text-xs text-gray-600">Marked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Test Submitted Successfully!</h3>
                <p className="text-sm text-green-600 mt-1">Thank you for completing the test.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {step === -1 ? (
              // Custom Fields Section
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Welcome to the Test!</h3>
                  <p className="text-gray-600 mt-2">Please provide your details before we begin</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((f) => (
                    <div key={f.id || f.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {f.name} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      {f.type === "dropdown" ? (
                        <select 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-300"
                          value={customResponses[f.id || f.name] || ""}
                          onChange={(e) => setCustomValue(f.id || f.name, e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {(f.options || []).map((opt, oi) => (
                            <option key={oi} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-300"
                          value={customResponses[f.id || f.name] || ""}
                          onChange={(e) => setCustomValue(f.id || f.name, e.target.value)}
                          placeholder={`Enter your ${f.name.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-6">
                  <button 
                    onClick={next}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ) : showAllQuestions ? (
              // All Questions View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">All Questions</h3>
                  <button
                    onClick={() => setShowAllQuestions(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Single View</span>
                  </button>
                </div>
                
                <div className="space-y-8">
                  {questions.map((question, qIndex) => renderQuestion(question, qIndex, false))}
                </div>
              </div>
            ) : (
              // Single Question View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Question {step + 1} of {questions.length}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAllQuestions(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>View All Questions</span>
                    </button>
                  </div>
                </div>

                {renderQuestion(questions[step], step, true)}

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button 
                    onClick={prev}
                    disabled={step === 0 && customFields.length === 0}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  
                  {step < questions.length - 1 ? (
                    <button 
                      onClick={next}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                      <span>Next Question</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Submit Test</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${
                message.includes("successfully") 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
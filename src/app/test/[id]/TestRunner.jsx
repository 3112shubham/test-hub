"use client";
import React, { useState, useEffect } from "react";
// We will enqueue submissions through API to avoid Firestore race conditions


export default function TestRunner({ test }) {
  const customFields = test.customFields || [];
  const questions = test.questions || [];

  const [step, setStep] = useState(customFields.length > 0 ? -1 : 0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [customResponses, setCustomResponses] = useState(() => {
    const init = {};
    customFields.forEach((f) => {
      init[f.id || f.name || f.key || f.name] = "";
    });
    return init;
  });

  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const setCustomValue = (id, value) => {
    setCustomResponses((prev) => ({ ...prev, [id]: value }));
  };

  const selectOption = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
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
  const answersArr = answers.map((ans, i) => ({ questionIndex: i, answer: ans }));

  return [{ customArr, answersArr, meta: { testName: test.testName } }];
};


  const resetForm = () => {
    setStep(customFields.length > 0 ? -1 : 0);
    setAnswers(Array(questions.length).fill(null));
    setCustomResponses(() => {
      const init = {};
      customFields.forEach((f) => {
        init[f.id || f.name || f.key || f.name] = "";
      });
      return init;
    });
    setShowAllQuestions(false);
  };

const handleSubmit = async () => {
  setLoading(true);
  setMessage("");

  const unanswered = answers.filter(a => a === null).length;
  if (unanswered > 0) {
    setMessage(`Please answer all questions. ${unanswered} question(s) remaining.`);
    setLoading(false);
    return;
  }

  try {
    const responseData = buildResponsesArray();

    const payload = {
      testId: test.id?.toString(), // important: must be string
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


  // Periodic sync: attempt to flush localStorage queue and call the sync API every 60s
  useEffect(() => {
    let mounted = true;

    const flushLocal = async () => {
      try {
        const queue = JSON.parse(localStorage.getItem('submissionQueue') || '[]');
        if (!queue || queue.length === 0) return;

        // Try to POST each item to enqueue API
        for (const item of queue) {
          try {
            const r = await fetch('/api/test-submissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
            if (r.ok) {
              // continue to next
            }
          } catch (err) {
            console.warn('Failed to flush local item', err);
            // stop early
            return;
          }
        }

        // If all enqueued successfully, clear local queue
        localStorage.removeItem('submissionQueue');
      } catch (err) {
        console.error('Flush local error', err);
      }
    };

    const doSync = async () => {
      try {
        await fetch('/api/test-submissions/sync', { method: 'POST' });
      } catch (err) {
        console.warn('Sync API failed', err);
      }
    };

    // Run immediately then every 60s
    flushLocal();
    doSync();
    const id = setInterval(() => {
      flushLocal();
      doSync();
    }, 15*60 * 1000);

    return () => {
      clearInterval(id);
      mounted = false;
    };
  }, []);

  const progress = ((step + 1) / questions.length) * 100;

  if (!test) return <div className="p-4">Test not found</div>;

  return (
    // Fullscreen wrapper
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Centered content with max width and full height */}
      <div className="w-full h-full max-w-5xl mx-auto px-4 py-6">
        {/* Success Alert */}
        {showSuccessAlert && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{test.testName}</h2>
            <p className="text-blue-100 mt-1">Complete the test below</p>
          </div>

          {/* Progress Bar */}
          {step >= 0 && (
            <div className="px-6 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {step + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Scrollable content area */}
          <div className="p-6 overflow-auto flex-1">
            {step === -1 ? (
              // Custom Fields Section
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Welcome!</h3>
                  <p className="text-gray-600 mt-2">Please provide your details before starting the test</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((f) => (
                    <div key={f.id || f.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {f.name} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      {f.type === "dropdown" ? (
                        <select 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={customResponses[f.id || f.name] || ""}
                          onChange={(e) => setCustomValue(f.id || f.name, e.target.value)}
                          placeholder={`Enter your ${f.name.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={next}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ) : showAllQuestions ? (
              // All Questions View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">All Questions</h3>
                  <button
                    onClick={() => setShowAllQuestions(false)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Switch to Single View
                  </button>
                </div>
                
                <div className="space-y-8">
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-start space-x-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-lg font-medium text-gray-800">{question.question}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 ml-11">
                        {question.options.map((opt, oi) => {
                          const selected = answers[qIndex] === oi;
                          return (
                            <button 
                              key={oi}
                              onClick={() => selectOption(qIndex, oi)}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selected 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                  selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                                }`}>
                                  {selected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="font-medium">{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowAllQuestions(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back to Single View
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Test'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Single Question View
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Question {step + 1} of {questions.length}
                  </h3>
                  <button
                    onClick={() => setShowAllQuestions(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Questions
                  </button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl bg-white">
                  <h4 className="text-lg font-medium text-gray-800 mb-6">{questions[step].question}</h4>
                  
                  <div className="space-y-3">
                    {questions[step].options.map((opt, oi) => {
                      const selected = answers[step] === oi;
                      return (
                        <button 
                          key={oi}
                          onClick={() => selectOption(step, oi)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selected 
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                              selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                            }`}>
                              {selected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-medium">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <button 
                    onClick={prev}
                    disabled={step === 0 && customFields.length === 0}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {step < questions.length - 1 ? (
                    <button 
                      onClick={next}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Test'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes("successfully") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            {/* Questions Navigation (Mini Map) */}
            {step >= 0 && !showAllQuestions && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Questions Navigation</h4>
                <div className="flex flex-wrap gap-2">
                  {questions.map((_, qIndex) => (
                    <button
                      key={qIndex}
                      onClick={() => setStep(qIndex)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                        qIndex === step
                          ? 'bg-blue-600 text-white'
                          : answers[qIndex] !== null
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      } hover:shadow-md`}
                    >
                      {qIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
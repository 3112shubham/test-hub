"use client";
import React, { useState, useEffect } from "react";
import StudentSignIn from "@/app/components/StudentSignIn";
import TestInterface from "@/app/components/TestInterface";

export default function TestRunner({ test }) {
  const customFields = test.customFields || [];
  const questions = test.questions || [];

  // Initialize state from localStorage
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return customFields.length > 0 ? -1 : 0;
    const saved = localStorage.getItem("testRunner_step");
    return saved ? parseInt(saved) : customFields.length > 0 ? -1 : 0;
  });

  const [customResponses, setCustomResponses] = useState(() => {
    if (typeof window === "undefined") {
      const init = {};
      customFields.forEach((f) => {
        init[f.id || f.name] = "";
      });
      return init;
    }
    const saved = localStorage.getItem("testRunner_customResponses");
    return saved
      ? JSON.parse(saved)
      : (() => {
          const init = {};
          customFields.forEach((f) => {
            init[f.id || f.name] = "";
          });
          return init;
        })();
  });

  const [answers, setAnswers] = useState(() => {
    if (typeof window === "undefined") {
      return questions.map((q) => {
        if (q.type === "multiple") return [];
        if (q.type === "text") return "";
        return null;
      });
    }
    const saved = localStorage.getItem("testRunner_answers");
    return saved
      ? JSON.parse(saved)
      : questions.map((q) => {
          if (q.type === "multiple") return [];
          if (q.type === "text") return "";
          return null;
        });
  });

  const [testPassword, setTestPassword] = useState("");
  const [visitedQuestions, setVisitedQuestions] = useState(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("testRunner_visitedQuestions");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [markedQuestions, setMarkedQuestions] = useState(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("testRunner_markedQuestions");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("testRunner_step", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem(
      "testRunner_customResponses",
      JSON.stringify(customResponses)
    );
  }, [customResponses]);

  useEffect(() => {
    localStorage.setItem("testRunner_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem(
      "testRunner_visitedQuestions",
      JSON.stringify([...visitedQuestions])
    );
  }, [visitedQuestions]);

  useEffect(() => {
    localStorage.setItem(
      "testRunner_markedQuestions",
      JSON.stringify([...markedQuestions])
    );
  }, [markedQuestions]);

  const handleSignInComplete = () => {
    setStep(0);
  };

  const handleTestComplete = () => {
    // Clear localStorage on test completion
    localStorage.removeItem("testRunner_step");
    localStorage.removeItem("testRunner_customResponses");
    localStorage.removeItem("testRunner_answers");
    localStorage.removeItem("testRunner_visitedQuestions");
    localStorage.removeItem("testRunner_markedQuestions");

    // Reset all state to initial values
    setCustomResponses(() => {
      const init = {};
      customFields.forEach((f) => {
        init[f.id || f.name] = "";
      });
      return init;
    });
    setTestPassword("");
    setMarkedQuestions(new Set());
    setVisitedQuestions(new Set());
    setAnswers(
      questions.map((q) => {
        if (q.type === "multiple") return [];
        if (q.type === "text") return "";
        return null;
      })
    );
    setStep(customFields.length > 0 ? -1 : 0);
  };

  const resetForm = () => {
    setStep(customFields.length > 0 ? -1 : 0);
    setCustomResponses(() => {
      const init = {};
      customFields.forEach((f) => {
        init[f.id || f.name] = "";
      });
      return init;
    });
    setAnswers(
      questions.map((q) => {
        if (q.type === "multiple") return [];
        if (q.type === "text") return "";
        return null;
      })
    );
    setVisitedQuestions(new Set());
    setMarkedQuestions(new Set());
    setTestPassword("");
  };

  if (!test) return <div className="p-4">Test not found</div>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {step === -1 ? (
        <StudentSignIn
          test={test}
          customFields={customFields}
          customResponses={customResponses}
          setCustomResponses={setCustomResponses}
          testPassword={testPassword}
          setTestPassword={setTestPassword}
          onSignInComplete={handleSignInComplete}
          onReset={resetForm}
        />
      ) : (
        <TestInterface
          test={test}
          questions={questions}
          step={step}
          setStep={setStep}
          answers={answers}
          setAnswers={setAnswers}
          visitedQuestions={visitedQuestions}
          setVisitedQuestions={setVisitedQuestions}
          markedQuestions={markedQuestions}
          setMarkedQuestions={setMarkedQuestions}
          customFields={customFields}
          onTestComplete={handleTestComplete}
          onReset={resetForm}
        />
      )}
    </div>
  );
}

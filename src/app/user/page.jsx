"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateTestForm from "../components/CreateTestForm";
import TestDetailsForm from "../components/TestDetailsForm";
import QuestionsForm from "../components/QuestionsForm";
import ViewTests from "../components/ViewTests";

export default function UserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeForm, setActiveForm] = useState("create-test");

  // Update active form based on URL parameter
  useEffect(() => {
    const form = searchParams.get("form");
    if (form) {
      setActiveForm(form);
    }
  }, [searchParams]);

  const renderActiveForm = () => {
    switch (activeForm) {
      case "create-test":
        return <CreateTestForm />;
      case "view-tests":
        return <ViewTests />;
      case "test-details":
        return <TestDetailsForm />;
      case "questions":
        return <QuestionsForm />;
      default:
        return <ViewTests />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Main Content */}
      <div className="container mx-auto pt-8">
        <div className="p-6 mt-8">
          {renderActiveForm()}
        </div>
      </div>
    </div>
  );
}

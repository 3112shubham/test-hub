"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateTestForm from "../components/CreateTestForm";
import TestDetailsForm from "../components/TestDetailsForm";
import QuestionsForm from "../components/QuestionsForm";
import ViewTests from "../components/ViewTests";

function UserPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeForm, setActiveForm] = useState("create-test");

  useEffect(() => {
    const form = searchParams.get("form");
    if (form) setActiveForm(form);
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
      <div className="container mx-auto pt-8">
        <div className="p-6 mt-8">{renderActiveForm()}</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserPageContent />
    </Suspense>
  );
}

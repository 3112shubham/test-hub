"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import CreateTestForm from "../components/CreateTestForm";
import TestDetailsForm from "../components/TestDetailsForm";
import QuestionsForm from "../components/QuestionsForm";
import ViewTests from "../components/ViewTests";

function UserPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeForm, setActiveForm] = useState("create-test");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const form = searchParams.get("form");
    if (form) setActiveForm(form);
  }, [searchParams]);

  // Wait for Firebase auth to initialize and redirect only if unauthenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCheckingAuth(false);
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

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
      {checkingAuth ? (
        <div className="container mx-auto pt-8">
          <div className="p-6 mt-8">Checking authentication...</div>
        </div>
      ) : (
        <div className="container mx-auto pt-8">
          <div className="p-6 mt-8">{renderActiveForm()}</div>
        </div>
      )}
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

"use client";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CreateTestForm from "../components/CreateTestForm";
import TestDetailsForm from "../components/TestDetailsForm";
import QuestionsForm from "../components/QuestionsForm";
import ViewTests from "../components/ViewTests";

export default function UserDashboard() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState("create-test");

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

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
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Spacer for navbar */}
      <div className="h-[10vh] w-full"></div>

      {/* Simple row layout */}
      <div className="flex w-full">
        {/* Sidebar - Fixed width */}
        <div className="w-64 flex-shrink-0">
          <Sidebar setActiveForm={setActiveForm} logout={logout} />
        </div>

        {/* Main Content - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <div className="px-6">{renderActiveForm()}</div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CreateTestForm from "../components/CreateTestForm";
import TestDetailsForm from "../components/TestDetailsForm";
import QuestionsForm from "../components/QuestionsForm";

export default function UserDashboard() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState("create-test");

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex h-screen max-w-7xl bg-gray-100">
      <Sidebar setActiveForm={setActiveForm} logout={logout} />

      <div className="flex-1 p-6 overflow-y-auto">
        {activeForm === "create-test" && <CreateTestForm />}
        {activeForm === "test-details" && <TestDetailsForm />}
        {activeForm === "questions" && <QuestionsForm />}
      </div>
    </div>
  );
}

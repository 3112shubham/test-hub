"use client";
import { usePathname } from "next/navigation";

export default function Sidebar({ setActiveForm, logout }) {
  const pathname = usePathname();

  if (pathname !== "/user") {
    return null;
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col justify-between min-h-[70vh] sticky top-[10vh] rounded-2xl">
      <div>
        <h2 className="text-2xl font-bold text-center py-6 border-b">
          Dashboard
        </h2>
        <ul className="p-4 space-y-3">
          <li>
            <button
              onClick={() => setActiveForm("create-test")}
              className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
            >
              🧩 Create Test
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveForm("view-tests")}
              className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
            >
              📋 View Tests
            </button>
          </li>
        </ul>
      </div>

      <button
        onClick={logout}
        className="m-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

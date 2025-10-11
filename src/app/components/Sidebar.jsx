"use client";
export default function Sidebar({ setActiveForm, logout }) {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-center py-6 border-b">
          Dashboard
        </h2>
        <ul className="p-4 space-y-3">
          <li>
            <button
              onClick={() => setActiveForm("create-test")}
              className="w-full text-left p-2 rounded hover:bg-gray-200"
            >
              🧩 Create Test
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveForm("test-details")}
              className="w-full text-left p-2 rounded hover:bg-gray-200"
            >
              📄 Test Details
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveForm("questions")}
              className="w-full text-left p-2 rounded hover:bg-gray-200"
            >
              ❓ Questions
            </button>
          </li>
        </ul>
      </div>

      <button
        onClick={logout}
        className="m-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

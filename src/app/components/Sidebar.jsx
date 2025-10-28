"use client";
import { usePathname } from "next/navigation";

export default function Sidebar({ setActiveForm, logout }) {
  const pathname = usePathname();

  if (pathname !== "/user") {
    return null;
  }

  return (
    <div className="w-64 bg-gradient-to-b from-white to-blue-50 shadow-lg shadow-blue-500/10 flex flex-col justify-between min-h-[90vh] sticky top-[10vh] rounded-2xl border border-blue-100">
      <div>
        <ul className="p-4 space-y-2">
          <li>
            <button
              onClick={() => setActiveForm("create-test")}
              className="w-full text-left p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-300 border border-transparent hover:border-blue-200 group"
            >
              <span className="text-[#1D4ED8] group-hover:text-[#00BCD4] font-medium">
                🧩 Create Test
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveForm("view-tests")}
              className="w-full text-left p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-300 border border-transparent hover:border-blue-200 group"
            >
              <span className="text-[#1D4ED8] group-hover:text-[#00BCD4] font-medium">
                📋 View Tests
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-blue-100">
        <div className="bg-gradient-to-r from-[#6BBF59]/10 to-[#00BCD4]/10 rounded-xl p-3 border border-[#6BBF59]/20">
          <p className="text-xs text-gray-600 text-center">
            Ready to evaluate with precision
          </p>
        </div>
      </div>
    </div>
  );
}
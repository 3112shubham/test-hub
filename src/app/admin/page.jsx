"use client";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">👑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Administrator!</p>
        </div>

        {/* Stats/Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-500">Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-sm text-green-500">Reports</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center">
            <span className="mr-3">👥</span>
            <span className="text-gray-700">Manage Users</span>
          </button>
          <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center">
            <span className="mr-3">📊</span>
            <span className="text-gray-700">View Analytics</span>
          </button>
          <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center">
            <span className="mr-3">⚙️</span>
            <span className="text-gray-700">Settings</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
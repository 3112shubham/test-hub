"use client";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">User Dashboard</h1>
      <p className="mb-4">Welcome, User! 🚀</p>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

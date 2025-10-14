"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig.js";

export default function Navbar() {
  const router = useRouter();

  const path = usePathname();

  if (path === "/login") return <></>;

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className="
      fixed top-0 left-1/2 -translate-x-1/2 
      z-50 w-full
      bg-white/90 
      backdrop-blur-xl border border-white/20
      shadow-lg 
      flex items-center justify-between px-6 py-3
      transition-all duration-300
    "
    >
      {/* Logo / Brand */}
      <h1
        onClick={() => router.push("/user")}
        className="text-xl font-semibold text-slate-900  cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Test Moj
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={logout}
          className="px-4 py-1.5 bg-rose-500 text-white  rounded-lg font-medium transition-all shadow-md hover:shadow-blue-500/30 active:scale-95"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

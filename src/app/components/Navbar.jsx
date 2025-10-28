"use client";

import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig.js";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const path = usePathname();

  if (path === "/login" || path.startsWith("/test/") || path === "/")
    return null;

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully 👋");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Try again!");
    }
  };

  return (
    <nav
      className="
        fixed top-0 left-1/2 -translate-x-1/2 
        z-50 w-full
        bg-white/90 
        shadow-md
        backdrop-blur-xl border border-white/20
        flex items-center justify-between px-6 py-3
        transition-all duration-300
      "
    >
      <div
        onClick={() => router.push("/")}
        className="flex items-center gap-2 cursor-pointer"
      > <Image
          src="/logol.png"
          alt="Logo"
          width={40}
          height={50}
          className="rounded-lg hover:opacity-90 transition-opacity"
          priority
        />
        <Image
          src="/logot.png"
          alt="Logo"
          width={100}
          height={100}
          className="rounded-lg hover:opacity-90 transition-opacity"
          priority
        />
      </div>
      
      <div className="flex items-center gap-4">
        {path === "/user" && (
          <>
          <button
            onClick={() => router.push("/user?form=create-test")}
            className="relative flex items-center gap-2 font-medium px-4 py-1.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full hover:text-blue-500 active:scale-95"
          >
            <span>🧩</span> Create Test
          </button>


            <button
              onClick={() => router.push("/user?form=view-tests")}
              className="relative flex items-center gap-2 font-medium px-4 py-1.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full hover:text-blue-500 active:scale-95"
            >
              <span>📋</span> View Tests
            </button>
          </>
        )}
        <button
          onClick={logout}
          className="px-4 py-1.5 bg-rose-500 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-blue-500/30 active:scale-95"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

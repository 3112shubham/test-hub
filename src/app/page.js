"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check for a simple `auth` cookie set by the login flow.
    // If absent, redirect to /login; otherwise redirect to /user.
    // (This is a lightweight client-side redirect — middleware-based
    // protection is recommended for production.)
    const hasAuth = document.cookie.split(";").some((c) => c.trim().startsWith("auth="));
    if (!hasAuth) {
      router.push("/login");
    } else {
      router.push("/user");
    }
  }, [router]);

  return null;
}

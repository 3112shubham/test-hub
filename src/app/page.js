"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  // Avoid performing navigation during render — move to an effect
  useEffect(() => {
    // replace condition `1` with your actual auth check or condition
    if (true) {
      router.push("/login");
    }
  }, [router]);
  
  return (
    <>
    </>
  );
}

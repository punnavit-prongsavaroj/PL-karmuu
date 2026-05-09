"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
      <div className="bg-[#141414] p-8 rounded-xl border border-gray-800 w-full max-w-sm">
        <h2 className="text-2xl mb-6 text-center text-[#C9A84C]">Admin Login</h2>
        <input className="w-full mb-4 p-3 bg-[#1A1A1A] rounded border border-gray-700" type="email" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        <input className="w-full mb-6 p-3 bg-[#1A1A1A] rounded border border-gray-700" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-[#C9A84C] text-black font-bold p-3 rounded">เข้าสู่ระบบ</button>
      </div>
    </div>
  );
}
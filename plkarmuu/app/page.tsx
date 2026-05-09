// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// ==========================================
// 🎨 ธีมสีของร้าน
// ==========================================
const theme = {
  gold: "#C9A84C",
  dark: "#0A0A0A",
  darkCard: "#141414",
  darkBorder: "#2A2A2A",
  textPrimary: "#F5F0E8",
  textSecondary: "#A09880",
};

// ==========================================
// 📌 ไอคอนต่างๆ
// ==========================================
const Icon = {
  Phone: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Line: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.365 9.863c.349.0.63.285.63.631.0.345-.281.63-.63.63H17.61v1.125h1.755c.349.0.63.283.63.63.0.344-.281.629-.63.629h-2.386c-.345.0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.346.0.627.285.627.63.0.349-.281.63-.627.63H17.61v1.125h1.755zm-5.955-.922c-.345.0-.627-.285-.627-.63V8.108c0-.345.282-.63.627-.63.346.0.628.285.628.63v.203c.0.345-.282.63-.628.63zm.0 4.316c-.345.0-.627-.285-.627-.63v-2.386c0-.345.282-.629.627-.629.346.0.628.284.628.629v2.386c0 .345-.282.63-.628.63zm-2.454.0c-.346.0-.628-.285-.628-.63V8.108c0-.345.282-.63.628-.63.345.0.627.285.627.63v2.535h1.125c.345.0.627.284.627.629.0.345-.282.63-.627.63h-1.755zm-3.568-2.613v2.613c0 .345-.282.63-.628.63-.345.0-.627-.285-.627-.63V8.108c0-.345.282-.63.627-.63.346.0.628.285.628.63v1.657l1.411-2.038c.119-.172.316-.279.526-.279.346.0.628.285.628.63v3.548c0 .345-.282.629-.628.629-.345.0-.627-.284-.627-.629V9.98l-1.411 2.038c-.118.171-.316.279-.526.279z" /></svg>,
  Web: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>,
  Admin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

// ==========================================
// 🚀 คอมโพเนนต์หน้าหลัก
// ==========================================
export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  // ✨ State เก็บข้อมูลร้านจาก Firebase
  const [storeConfig, setStoreConfig] = useState({ 
    phone: "02-123-4567", 
    lineOA: "https://line.me/R/ti/p/@your_oa_id",
    openTime: "11:00",
    closeTime: "22:00"
  });

  // ✨ ดึงข้อมูลร้านแบบ Real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (d) => {
      if (d.exists()) {
        setStoreConfig(prev => ({ ...prev, ...d.data() }));
      }
    });
    return () => unsub();
  }, []);

  const options = [
    // ✨ ดึงเบอร์โทรจาก Database มาใส่
    { id: "phone", icon: <Icon.Phone />, label: "โทรหาร้าน", sub: "พูดคุยกับพนักงานโดยตรง", action: () => makeCall(window.location.href = "tel:" + {storeConfig.phone}) },
    // ✨ ดึงลิงก์ Line จาก Database มาใส่
    { id: "line", icon: <Icon.Line />, label: "จองผ่าน LINE", sub: "สะดวกเข้าใจง่ายแชทผ่าน LINE ", action: () => window.open(storeConfig.lineOA, "_blank") },
    { id: "web", icon: <Icon.Web />, label: "จองผ่านเว็บไซต์", sub: "จองพร้อมสั่งอาหารล่วงหน้าทันทีรวดเร็ว", action: () => router.push("/book") },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: theme.dark }}>
      
      {/* พื้นหลังไล่สี */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top, rgba(201,168,76,0.15) 0%, ${theme.dark} 70%)` }} />
      
      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-10">
        <div>
          <div className="text-2xl font-serif text-[#F5F0E8]">PorLor</div>
          <div className="text-[10px] tracking-[4px] mt-1" style={{ color: theme.textSecondary }}>RESTAURANT</div>
        </div>
        <button 
          onClick={() => router.push("/admin/login")} 
          className="flex flex-col items-center text-xs opacity-50 hover:opacity-100 transition"
          style={{ color: theme.textSecondary }}
        >
          <Icon.Admin />
          <span>Admin</span>
        </button>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 -mt-10">
        <div className="text-xs tracking-[6px] mb-4 uppercase" style={{ color: theme.gold }}>Some chase dreams. I chase pork leg</div>
        <h1 className="text-5xl md:text-7xl font-serif mb-6" style={{ color: theme.textPrimary }}>PorLor Karmuu</h1>
        <p className="max-w-md mx-auto mb-12" style={{ color: theme.textSecondary }}>
          ประสบการณ์ขาหมูแท้ที่ถ่ายทอดสูตรจากรุ่นสู่รุ่น <br/>ในบรรยากาศร้านสบายๆ
        </p>

        {/* ปุ่ม 3 แบบ (โทร, ไลน์, เว็บ) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {options.map(opt => (
            <button 
              key={opt.id} 
              onClick={opt.action}
              onMouseEnter={() => setHovered(opt.id)}
              onMouseLeave={() => setHovered(null)}
              className="p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
              style={{
                background: hovered === opt.id 
                  ? (opt.id === "web" ? "rgba(201,168,76,0.9)" : "rgba(255,255,255,0.1)") 
                  : "rgba(20,20,20,0.8)",
                border: `1px solid ${hovered === opt.id ? (opt.id === "web" ? theme.gold : "#555") : theme.darkBorder}`,
                color: hovered === opt.id && opt.id === "web" ? "#000" : theme.textPrimary,
                boxShadow: hovered === opt.id ? "0 10px 30px rgba(0,0,0,0.5)" : "none"
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors"
                   style={{ background: hovered === opt.id && opt.id === "web" ? "rgba(0,0,0,0.1)" : "rgba(201,168,76,0.15)", color: hovered === opt.id && opt.id === "web" ? "#000" : theme.gold }}>
                {opt.icon}
              </div>
              <div className="text-lg font-bold mb-2">{opt.label}</div>
              <div className="text-sm opacity-80">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-xs relative z-10" style={{ color: theme.textSecondary, borderTop: `1px solid ${theme.darkBorder}` }}>
        {/* ✨ ดึงเวลาและเบอร์โทรจาก Database มาแสดง */}
        เปิดทุกวัน {storeConfig.openTime} - {storeConfig.closeTime} น. | {storeConfig.phone} | Sukhumvit Rd, Bangkok
      </div>
    </div>
  );
}
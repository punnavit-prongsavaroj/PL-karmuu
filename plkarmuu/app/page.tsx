“use client”;

import { useState, useEffect } from “react”;
import { useRouter } from “next/navigation”;
import { doc, onSnapshot } from “firebase/firestore”;
import { db } from “@/lib/firebase/config”;
import { motion } from “framer-motion”; // ต้องติดตั้ง: npm install framer-motion

// ==========================================
// 🎨 ธีมสีของร้าน
// ==========================================
const theme = {
gold: “#C9A84C”,
dark: “#0A0A0A”,
darkCard: “#141414”,
darkBorder: “#2A2A2A”,
textPrimary: “#F5F0E8”,
textSecondary: “#A09880”,
};

// ==========================================
// 📌 ไอคอนต่างๆ
// ==========================================
const Icon = {
Phone: () => (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 md:w-7 md:h-7">
<path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
</svg>
),
Map: () => (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 md:w-7 md:h-7">
<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
),
Web: () => (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 md:w-7 md:h-7">
<circle cx="12" cy="12" r="10" />
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
<path d="M2 12h20" />
</svg>
),
Admin: () => (
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mb-1">
<path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
</svg>
),
};

// ==========================================
// 🖼️ ข้อมูลรูปภาพ (เพิ่มรูปเดิมซ้ำเพื่อทำ Loop ไหลลื่น)
// ==========================================
const galleryImages = [
{ id: 1, src: “/images/1.webp” },
{ id: 2, src: “/images/2.webp” },
{ id: 3, src: “/images/3.webp” },
{ id: 4, src: “/images/4.webp” },
];

// รวมรูปภาพ 2 ชุดเพื่อให้เลื่อนวนลูปได้ไม่สะดุด
const duplicatedImages = […galleryImages, …galleryImages];

export default function LandingPage() {
const router = useRouter();
const [hovered, setHovered] = useState<string | null>(null);

const [storeConfig, setStoreConfig] = useState({
phone: “02-123-4567”,
googleMapsUrl: “https://share.google/EgRCnolQRmyotbmZr”,
openTime: “11:00”,
closeTime: “22:00”,
});

useEffect(() => {
const unsub = onSnapshot(doc(db, “settings”, “store”), (d) => {
if (d.exists()) {
setStoreConfig((prev) => ({ …prev, …d.data() }));
}
});
return () => unsub();
}, []);

const options = [
{
id: “web”,
icon: <Icon.Web />,
label: “จองและสั่งอาหาร”,
sub: “จองโต๊ะพร้อมสั่งอาหารล่วงหน้า”,
action: () => router.push(”/book”),
},
{
id: “phone”,
icon: <Icon.Phone />,
label: “โทรหาร้าน”,
sub: “คุยกับพนักงาน”,
action: () => { window.location.href = `tel:${storeConfig.phone}`; },
},
{
id: “map”,
icon: <Icon.Map />,
label: “แผนที่”,
sub: “Google Maps”,
action: () => window.open(storeConfig.googleMapsUrl, “_blank”),
},
];

return (
<div className=“min-h-screen flex flex-col relative overflow-hidden” style={{ background: theme.dark }}>
{/* Background Gradient */}
<div
className=“absolute inset-0 pointer-events-none”
style={{
background: `radial-gradient(ellipse at top, rgba(201,168,76,0.12) 0%, ${theme.dark} 75%)`,
}}
/>

```
  {/* Header */}
  <header className="p-6 md:px-12 flex justify-between items-center relative z-20">
    <div>
      <div className="text-2xl font-serif text-[#F5F0E8]">PorLor</div>
      <div className="text-[10px] tracking-[4px] mt-1" style={{ color: theme.textSecondary }}>
        RESTAURANT
      </div>
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
  <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 py-10">
    <div className="text-[10px] md:text-xs tracking-[6px] mb-4 uppercase" style={{ color: theme.gold }}>
      Some chase dreams. I chase pork leg
    </div>
    <h1 className="text-5xl md:text-7xl font-serif mb-4" style={{ color: theme.textPrimary }}>
      PorLor Karmuu
    </h1>
    <p className="max-w-md mx-auto mb-12 text-sm md:text-base px-6" style={{ color: theme.textSecondary }}>
      ประสบการณ์ขาหมูแท้ที่ถ่ายทอดสูตรจากรุ่นสู่รุ่น ในบรรยากาศร้านที่อบอุ่น
    </p>

    {/* 📌 Infinite Scrolling Gallery (บานเลื่อนวนลูป) */}
    <div className="w-full relative overflow-hidden mb-16 py-4">
      <motion.div
        className="flex gap-4 px-4"
        animate={{
          x: ["0%", "-50%"], // เลื่อนจากจุดเริ่มไปครึ่งนึง (เพราะเราเบิ้ลรูปไว้)
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20, // ความเร็วในการเลื่อน (ยิ่งมากยิ่งช้า)
            ease: "linear",
          },
        }}
        style={{ width: "fit-content" }}
      >
        {duplicatedImages.map((img, index) => (
          <div
            key={`${img.id}-${index}`}
            className="relative flex-shrink-0 w-[200px] md:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden border border-[#2A2A2A]"
          >
            <img
              src={img.src}
              alt={`ข้าวขาหมู PorLor ${img.id}`}
              className="w-full h-full object-cover"
            />
            {/* Overlay บางๆ ให้ดูหรู */}
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500" />
          </div>
        ))}
      </motion.div>

      {/* แสง Gradient ปิดหัวท้ายเพื่อให้ดู Fade หายไป */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
    </div>

    {/* 📌 Grid Layout for Buttons */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl px-4">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={opt.action}
          onMouseEnter={() => setHovered(opt.id)}
          onMouseLeave={() => setHovered(null)}
          className={`
            relative p-6 md:p-10 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95
            ${opt.id === "web" ? "col-span-2 md:col-span-1" : "col-span-1"}
          `}
          style={{
            background:
              hovered === opt.id
                ? opt.id === "web"
                  ? "rgba(201,168,76,0.95)"
                  : "rgba(255,255,255,0.08)"
                : "rgba(20,20,20,0.6)",
            border: `1px solid ${
              hovered === opt.id ? (opt.id === "web" ? theme.gold : "#444") : theme.darkBorder
            }`,
            color: hovered === opt.id && opt.id === "web" ? "#000" : theme.textPrimary,
            boxShadow: hovered === opt.id ? `0 10px 30px rgba(0,0,0,0.4)` : "none",
          }}
        >
          <div
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-5 transition-colors"
            style={{
              background:
                hovered === opt.id && opt.id === "web"
                  ? "rgba(0,0,0,0.1)"
                  : "rgba(201,168,76,0.1)",
              color: hovered === opt.id && opt.id === "web" ? "#000" : theme.gold,
            }}
          >
            {opt.icon}
          </div>
          <div className="text-base md:text-xl font-bold mb-1">{opt.label}</div>
          <div className="text-[10px] md:text-xs opacity-70">
            {opt.sub}
          </div>
        </button>
      ))}
    </div>
  </div>

  {/* Footer */}
  <footer
    className="mt-12 py-8 text-center text-[10px] md:text-xs relative z-10"
    style={{ color: theme.textSecondary, borderTop: `1px solid ${theme.darkBorder}` }}
  >
    <p className="mb-2">
      เปิดให้บริการทุกวัน: {storeConfig.openTime} - {storeConfig.closeTime} น.
    </p>
    <p className="opacity-60">
      {storeConfig.phone} | Sukhumvit Rd, Bangkok, Thailand
    </p>
  </footer>
</div>
```

);
}
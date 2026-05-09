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
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Web: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
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
// 🖼️ Gallery รูปภาพ
// ==========================================
const galleryImages = [
  {
    id: 1,
    src: "/images/dish-1.jpg", // ใส่ path รูปจริงของคุณ
    alt: "ขาหมูเยอรมัน",
    title: "ขาหมูเยอรมัน",
  },
  {
    id: 2,
    src: "/images/dish-2.jpg",
    alt: "ข้าวขาหมู",
    title: "ข้าวขาหมูสูตรต้นตำรับ",
  },
  {
    id: 3,
    src: "/images/interior.jpg",
    alt: "บรรยากาศร้าน",
    title: "บรรยากาศภายในร้าน",
  },
  {
    id: 4,
    src: "/images/dish-3.jpg",
    alt: "เมนูพิเศษ",
    title: "เมนูพิเศษประจำวัน",
  },
];

// ==========================================
// 🚀 คอมโพเนนต์หน้าหลัก
// ==========================================
export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  // ✨ State เก็บข้อมูลร้านจาก Firebase
  const [storeConfig, setStoreConfig] = useState({
    phone: "02-123-4567",
    googleMapsUrl: "[maps.app.goo.gl](https://maps.app.goo.gl/your_map_link)", // ✨ เปลี่ยนเป็น Google Maps
    openTime: "11:00",
    closeTime: "22:00",
  });

  // ✨ ดึงข้อมูลร้านแบบ Real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (d) => {
      if (d.exists()) {
        setStoreConfig((prev) => ({ ...prev, ...d.data() }));
      }
    });
    return () => unsub();
  }, []);

  const options = [
    {
      id: "phone",
      icon: <Icon.Phone />,
      label: "โทรหาร้าน",
      sub: "พูดคุยกับพนักงานโดยตรง",
      action: () => {
        window.location.href = `tel:${storeConfig.phone}`;
      },
    },
    // ✨ เปลี่ยนจาก LINE เป็น Google Maps
    {
      id: "map",
      icon: <Icon.Map />,
      label: "นำทางไปร้าน",
      sub: "เปิด Google Maps นำทางทันที",
      action: () => window.open(storeConfig.googleMapsUrl, "_blank"),
    },
    {
      id: "web",
      icon: <Icon.Web />,
      label: "จองผ่านเว็บไซต์",
      sub: "จองพร้อมสั่งอาหารล่วงหน้าทันที",
      action: () => router.push("/book"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: theme.dark }}>
      {/* พื้นหลังไล่สี */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at top, rgba(201,168,76,0.15) 0%, ${theme.dark} 70%)`,
        }}
      />

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-10">
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
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className="text-xs tracking-[6px] mb-4 uppercase" style={{ color: theme.gold }}>
          Some chase dreams. I chase pork leg
        </div>
        <h1 className="text-5xl md:text-7xl font-serif mb-6" style={{ color: theme.textPrimary }}>
          PorLor Karmuu
        </h1>
        <p className="max-w-md mx-auto mb-10" style={{ color: theme.textSecondary }}>
          ประสบการณ์ขาหมูแท้ที่ถ่ายทอดสูตรจากรุ่นสู่รุ่น
          <br />
          ในบรรยากาศร้านสบายๆ
        </p>

        {/* ✨ Gallery Section */}
        <div className="w-full max-w-4xl mb-12 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                onMouseEnter={() => setHoveredImage(img.id)}
                onMouseLeave={() => setHoveredImage(null)}
                style={{
                  border: `1px solid ${hoveredImage === img.id ? theme.gold : theme.darkBorder}`,
                  transition: "all 0.4s ease",
                  transform: hoveredImage === img.id ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* รูปภาพ */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{
                    transform: hoveredImage === img.id ? "scale(1.1)" : "scale(1)",
                  }}
                />

                {/* Overlay gradient */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)`,
                    opacity: hoveredImage === img.id ? 1 : 0.6,
                  }}
                />

                {/* Gold border glow on hover */}
                <div
                  className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 20px rgba(201,168,76,0.3)`,
                    opacity: hoveredImage === img.id ? 1 : 0,
                  }}
                />

                {/* Title */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 transition-all duration-300"
                  style={{
                    transform: hoveredImage === img.id ? "translateY(0)" : "translateY(8px)",
                    opacity: hoveredImage === img.id ? 1 : 0.8,
                  }}
                >
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: theme.textPrimary }}
                  >
                    {img.title}
                  </p>
                </div>

                {/* Corner accent */}
                <div
                  className="absolute top-2 right-2 w-6 h-6 transition-opacity duration-300"
                  style={{
                    opacity: hoveredImage === img.id ? 1 : 0,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: `rgba(201,168,76,0.9)` }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ปุ่ม 3 แบบ (โทร, แผนที่, เว็บ) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={opt.action}
              onMouseEnter={() => setHovered(opt.id)}
              onMouseLeave={() => setHovered(null)}
              className="p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
              style={{
                background:
                  hovered === opt.id
                    ? opt.id === "web"
                      ? "rgba(201,168,76,0.9)"
                      : "rgba(255,255,255,0.1)"
                    : "rgba(20,20,20,0.8)",
                border: `1px solid ${
                  hovered === opt.id ? (opt.id === "web" ? theme.gold : "#555") : theme.darkBorder
                }`,
                color: hovered === opt.id && opt.id === "web" ? "#000" : theme.textPrimary,
                boxShadow: hovered === opt.id ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors"
                style={{
                  background:
                    hovered === opt.id && opt.id === "web"
                      ? "rgba(0,0,0,0.1)"
                      : "rgba(201,168,76,0.15)",
                  color: hovered === opt.id && opt.id === "web" ? "#000" : theme.gold,
                }}
              >
                {opt.icon}
              </div>
              <div className="text-lg font-bold mb-2">{opt.label}</div>
              <div className="text-sm opacity-80">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="py-6 text-center text-xs relative z-10"
        style={{ color: theme.textSecondary, borderTop: `1px solid ${theme.darkBorder}` }}
      >
        เปิดทุกวัน {storeConfig.openTime} - {storeConfig.closeTime} น. | {storeConfig.phone} | Sukhumvit
        Rd, Bangkok
      </div>
    </div>
  );
}

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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-6 h-6 md:w-7 md:h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  ),

  Map: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-6 h-6 md:w-7 md:h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),

  Web: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-6 h-6 md:w-7 md:h-7"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),

  Admin: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5 mb-1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
};

// ==========================================
// 🖼️ รูปภาพ
// ==========================================
const galleryImages = [
  { id: 1, src: "/images/1.webp" },
  { id: 2, src: "/images/2.webp" },
  { id: 3, src: "/images/3.webp" },
  { id: 4, src: "/images/4.webp" },
];

// สำคัญ: ใช้ ...
const duplicatedImages = [...galleryImages, ...galleryImages];

export default function LandingPage() {
  const router = useRouter();

  const [hovered, setHovered] = useState<string | null>(null);

  const [storeConfig, setStoreConfig] = useState({
    phone: "02-123-4567",
    googleMapsUrl: "https://share.google/EgRCnolQRmyotbmZr",
    openTime: "11:00",
    closeTime: "22:00",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (d) => {
      if (d.exists()) {
        setStoreConfig((prev) => ({
          ...prev,
          ...d.data(),
        }));
      }
    });

    return () => unsub();
  }, []);

  const options = [
    {
      id: "web",
      icon: <Icon.Web />,
      label: "จองและสั่งอาหาร",
      sub: "จองโต๊ะพร้อมสั่งอาหารล่วงหน้า",
      action: () => router.push("/book"),
    },
    {
      id: "phone",
      icon: <Icon.Phone />,
      label: "โทรหาร้าน",
      sub: "คุยกับพนักงาน",
      action: () => {
        window.location.href = `tel:${storeConfig.phone}`;
      },
    },
    {
      id: "map",
      icon: <Icon.Map />,
      label: "แผนที่",
      sub: "Google Maps",
      action: () => window.open(storeConfig.googleMapsUrl, "_blank"),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: theme.dark }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, rgba(201,168,76,0.12) 0%, ${theme.dark} 75%)`,
        }}
      />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full relative overflow-hidden mb-16 py-4">
  <div className="marquee flex gap-4 px-4 w-max">
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

        <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500" />
      </div>
    ))}
  </div>

  {/* Fade */}
  <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
  <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
</div>
      </div>
    </div>
  );
}
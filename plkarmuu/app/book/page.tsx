// app/book/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

// ไอคอนต่างๆ
const Icon = {
  Table: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M4 10v8m16-8v8M8 10V6a2 2 0 012-2h4a2 2 0 012 2v4" /></svg>,
  Food: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2h2zm0 8a8 8 0 100 16 8 8 0 000-16z" /><path d="M12 14v4M10 16h4" /></svg>,
  Star: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#C9A84C]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Arrow: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
};

export default function BookingTypePage() {
  const router = useRouter();
  const setBookingDraft = useAppStore((state) => state.setBookingDraft);

  const types = [
    { 
      id: "table", 
      icon: <Icon.Table />, 
      label: "จองโต๊ะ", 
      desc: "เลือกโต๊ะ วันเวลา และจำนวนคน", 
      route: "/book/datetime" 
    },
    { 
      id: "food", 
      icon: <Icon.Food />, 
      label: "สั่งอาหารล่วงหน้า", 
      desc: "เลือกเมนูที่ต้องการ (รับกลับบ้าน)", 
      route: "/book/menu" 
    },
    { 
      id: "both", 
      icon: <Icon.Star />, 
      label: "จองโต๊ะ + สั่งอาหาร", 
      desc: "ครบทุกอย่างในขั้นตอนเดียว", 
      route: "/book/datetime" 
    },
  ];

  const handleSelect = (typeId: string, route: string) => {
    // 1. บันทึกประเภทที่เลือกลงในกล่องความจำ
    setBookingDraft({ bookingType: typeId as any });
    // 2. เปลี่ยนหน้าไปขั้นตอนต่อไป
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col">
      
      {/* Header */}
      <header className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex items-center">
        <button onClick={() => router.push("/")} className="p-2 text-[#A09880] hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-serif text-xl ml-2">เลือกประเภทการจอง</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-lg mx-auto w-full mt-8">
        <div className="flex flex-col gap-4">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id, t.route)}
              className="flex items-center text-left p-4 bg-[#141414] border border-[#2A2A2A] hover:border-[#C9A84C] rounded-2xl transition-all group"
            >
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-black/30 border border-[#2A2A2A] flex items-center justify-center text-[#C9A84C] shrink-0">
                {t.icon}
              </div>
              
              {/* Text */}
              <div className="ml-4 flex-1">
                <div className="font-bold text-lg">{t.label}</div>
                <div className="text-sm text-[#A09880] mt-1">{t.desc}</div>
              </div>

              {/* Arrow */}
              <div className="text-[#A09880] group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-transform">
                <Icon.Arrow />
              </div>
            </button>
          ))}
        </div>
      </main>

    </div>
  );
}
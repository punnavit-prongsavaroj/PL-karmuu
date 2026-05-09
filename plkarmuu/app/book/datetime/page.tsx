// app/book/datetime/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function DateTimePage() {
  const router = useRouter();
  const { bookingDraft, setBookingDraft } = useAppStore();
  
  // State สำหรับเก็บช่วงเวลาที่กดจองได้
  const [hours, setHours] = useState<string[]>([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // ไปดึงเวลาเปิด-ปิดร้านที่แอดมินตั้งไว้
    const unsub = onSnapshot(doc(db, "settings", "store"), (d) => {
      let openT = "11:00";
      let closeT = "22:00";
      if (d.exists()) {
        openT = d.data().openTime;
        closeT = d.data().closeTime;
      }

      const openHour = parseInt(openT.split(":")[0]);
      const closeHour = parseInt(closeT.split(":")[0]);
      
      const generatedHours = [];
      // 💡 สร้างปุ่มเวลา โดยให้คิวสุดท้ายจบก่อนร้านปิด 2 ชั่วโมง
      // เช่น ร้านปิด 22:00 คิวสุดท้ายที่จองได้คือ 20:00
      for (let i = openHour; i <= closeHour - 2; i++) {
        generatedHours.push(`${i.toString().padStart(2, "0")}:00`);
      }
      setHours(generatedHours);
    });

    return () => unsub();
  }, []);

  const handleTimeSelect = (time: string) => {
    const [h] = time.split(":").map(Number);
    const endTime = `${(h + 2).toString().padStart(2, "0")}:00`;
    setBookingDraft({ startTime: time, endTime });
  };

  const handleNext = () => {
    if (!bookingDraft.date) return alert("กรุณาเลือกวันที่");
    if (!bookingDraft.startTime) return alert("กรุณาเลือกเวลา");
    router.push("/book/table");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col">
      <header className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex items-center">
        <button onClick={() => router.back()} className="p-2 text-[#A09880] hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-serif text-xl ml-2">เลือกวันและเวลา</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full mt-4 space-y-8">
        <div>
          <label className="block text-sm text-[#A09880] mb-2">วันที่ต้องการจอง</label>
          <input 
            type="date" 
            min={today}
            value={bookingDraft.date}
            onChange={(e) => setBookingDraft({ date: e.target.value })}
            className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 text-white focus:border-[#C9A84C] outline-none [color-scheme:dark]"
          />
        </div>

        <div className={`transition-opacity ${bookingDraft.date ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <label className="block text-sm text-[#A09880] mb-2">เวลาที่ต้องการ (ทานได้ 2 ชั่วโมง)</label>
          {hours.length === 0 ? (
            <div className="text-sm text-gray-500">กำลังดึงเวลาทำการ...</div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {hours.map((h) => {
                const isSelected = bookingDraft.startTime === h;
                return (
                  <button
                    key={h}
                    onClick={() => handleTimeSelect(h)}
                    className={`py-3 rounded-xl border transition-all text-sm font-medium
                      ${isSelected 
                        ? 'bg-[rgba(201,168,76,0.15)] border-[#C9A84C] text-[#C9A84C]' 
                        : 'bg-[#141414] border-[#2A2A2A] text-[#A09880] hover:border-gray-500'}`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {bookingDraft.startTime && (
          <div className="p-4 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-xl text-center">
            <div className="text-[#C9A84C] font-medium">
              เวลาจอง: {bookingDraft.startTime} — {bookingDraft.endTime} น.
            </div>
          </div>
        )}
      </main>

      <div className="p-4 bg-[#141414] border-t border-[#2A2A2A]">
        <button 
          onClick={handleNext}
          className="w-full max-w-lg mx-auto block bg-[#C9A84C] text-[#0A0A0A] font-bold text-lg py-4 rounded-xl hover:bg-[#E8C878] transition-colors"
        >
          เลือกโต๊ะ ถัดไป →
        </button>
      </div>
    </div>
  );
}
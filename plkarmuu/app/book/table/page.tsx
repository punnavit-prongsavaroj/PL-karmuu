// app/book/table/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { useTables, useBookedSlots } from "@/hooks/useDatabase";
import { Table } from "@/types";

// ฟังก์ชันเช็คว่าเวลาที่ลูกค้าเลือก ชนกับคิวที่มีคนจองไปแล้วหรือไม่
function isTimeConflict(start1: string, end1: string, start2: string, end2: string) {
  const t2m = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  return t2m(start1) < t2m(end2) && t2m(end1) > t2m(start2);
}

export default function TableSelectPage() {
  const router = useRouter();
  const { bookingDraft, setBookingDraft } = useAppStore();
  const tables = useTables(); // ดึงโต๊ะจาก Firebase

  const handleNext = () => {
    if (!bookingDraft.tableId) return alert("กรุณาเลือกโต๊ะ");
    
    // ถ้าลูกค้าเลือกประเภท "สั่งอาหารด้วย" ให้ไปหน้าเมนู ถ้าไม่ ให้ไปหน้ายืนยันเลย
    if (bookingDraft.bookingType === "both" || bookingDraft.bookingType === "food") {
      router.push("/book/menu");
    } else {
      router.push("/confirm");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col">
      <header className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex items-center">
        <button onClick={() => router.back()} className="p-2 text-[#A09880] hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-serif text-xl ml-2">เลือกโต๊ะ</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        {/* แถบคำอธิบายสี (Legend) */}
        <div className="flex gap-4 mb-8 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4CAF7A] rounded-sm"></div>ว่าง</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#E05252] rounded-sm"></div>ไม่ว่าง</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#2A2A2A] rounded-sm"></div>เลือกอยู่</div>
        </div>

        {/* ถ้ายังไม่มีข้อมูลใน Database */}
        {tables.length === 0 && (
          <div className="text-center text-[#A09880] mt-10">
            กำลังโหลดข้อมูลโต๊ะ... <br/>(หากรอนาน แสดงว่ายังไม่ได้เพิ่มโต๊ะในระบบแอดมิน)
          </div>
        )}

        {/* วาดผังโต๊ะ */}
        <div className="grid grid-cols-2 gap-4">
          {tables.map((t) => (
            <TableCard key={t.id} table={t} />
          ))}
        </div>
      </main>

      {/* ปุ่มถัดไป */}
      {bookingDraft.tableId && (
        <div className="p-4 bg-[#141414] border-t border-[#2A2A2A]">
          <div className="text-center text-sm text-[#A09880] mb-2">
            {/* ✨ เปลี่ยนจาก tableId เป็น tableName */}
            โต๊ะที่เลือก: <span className="text-white font-bold">{bookingDraft.tableName}</span>
          </div>
          <button 
            onClick={handleNext}
            className="w-full max-w-lg mx-auto block bg-[#C9A84C] text-[#0A0A0A] font-bold text-lg py-4 rounded-xl hover:bg-[#E8C878] transition-colors"
          >
            ดำเนินการต่อ →
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Component ย่อย: การ์ดแสดงโต๊ะแต่ละตัว
// ==========================================
function TableCard({ table }: { table: Table }) {
  const { bookingDraft, setBookingDraft } = useAppStore();
  // ดึงคิวจองของโต๊ะนี้ ในวันที่ลูกค้าเลือก
  const bookedSlots = useBookedSlots(table.id as string, bookingDraft.date);
  
  // ตรวจสอบว่าโต๊ะนี้ว่างไหม ในเวลาที่ลูกค้าเลือก
  const isConflict = bookedSlots.some(slot => 
    isTimeConflict(bookingDraft.startTime, bookingDraft.endTime, slot.start, slot.end)
  );

  const isSelected = bookingDraft.tableId === table.id;
  const isAvailable = !isConflict && table.status === "available";

  // กำหนดสี
  let bg = "bg-[#141414]";
  let border = "border-[#2A2A2A]";
  let textColor = "text-white";

  if (isSelected) {
    bg = "bg-[rgba(201,168,76,0.15)]";
    border = "border-[#C9A84C]";
    textColor = "text-[#C9A84C]";
  } else if (!isAvailable) {
    bg = "bg-[rgba(224,82,82,0.05)]";
    border = "border-[rgba(224,82,82,0.3)]";
    textColor = "text-[#E05252]";
  }

  const handleSelect = () => {
    if (!isAvailable) return alert("โต๊ะนี้ไม่ว่างในช่วงเวลาที่คุณเลือกครับ");
    // ✨ เพิ่ม tableName เข้าไป
    setBookingDraft({ tableId: table.id, tableName: table.name }); 
  };

  return (
    <button
      onClick={handleSelect}
      disabled={!isAvailable && !isSelected}
      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${bg} ${border} ${!isAvailable ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#C9A84C]'}`}
    >
      <div className={`text-xs tracking-widest mb-1 ${isAvailable && !isSelected ? 'text-[#4CAF7A]' : textColor}`}>
        {isSelected ? "✓ เลือกแล้ว" : isAvailable ? "ว่าง" : "ติดจอง"}
      </div>
      <div className="font-serif text-3xl mb-1">{table.name}</div>
      <div className="text-sm text-[#A09880]">{table.seats} ที่นั่ง</div>
    </button>
  );
}
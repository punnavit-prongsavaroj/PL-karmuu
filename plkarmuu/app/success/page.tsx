// app/success/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// สร้าง Component ย่อยสำหรับเนื้อหา
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // ดึง ID การจองที่ Backend ส่งมาทาง URL

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center">
      
      {/* ไอคอนเครื่องหมายถูก (สีเขียว) */}
      <div className="w-24 h-24 bg-[rgba(76,175,122,0.1)] text-[#4CAF7A] rounded-full flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="font-serif text-4xl mb-4 text-[#C9A84C]">จองสำเร็จแล้ว!</h1>
      <p className="text-[#A09880] mb-8 max-w-sm">
        ขอบคุณที่เลือกใช้บริการ Aroi Thai <br/>ระบบได้บันทึกการจองของคุณเรียบร้อยแล้ว
      </p>

      {/* กล่องแสดงรหัสการจอง */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-sm mb-8 shadow-2xl">
        <div className="text-xs tracking-[3px] text-[#A09880] mb-2 uppercase">รหัสอ้างอิงของคุณ</div>
        {/* เอา ID มาตัดให้เหลือแค่ 8 ตัวอักษร เพื่อให้ลูกค้าจำง่ายๆ */}
        <div className="font-mono text-3xl tracking-widest text-white font-bold">
          {id ? id.slice(0, 8).toUpperCase() : "AROI-THAI"}
        </div>
        <div className="text-sm text-[#A09880] mt-4">กรุณาแจ้งรหัสนี้หรือเบอร์โทรศัพท์กับพนักงานเมื่อมาถึงร้าน</div>
      </div>

      {/* ปุ่มกลับหน้าหลัก */}
      <button 
        onClick={() => router.push("/")}
        className="text-[#0A0A0A] bg-[#C9A84C] font-bold py-4 px-12 rounded-xl hover:bg-[#E8C878] transition shadow-lg shadow-[#C9A84C]/20"
      >
        กลับสู่หน้าหลัก
      </button>

    </div>
  );
}

// หน้าหลักที่ครอบด้วย Suspense (เพื่อป้องกัน Error Build ใน Next.js)
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-[#C9A84C] flex items-center justify-center font-serif text-2xl">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
// app/confirm/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

export default function ConfirmPage() {
  const router = useRouter();
  const { bookingDraft, cart, cartTotal, clearCart, clearBookingDraft } = useAppStore();
  const [form, setForm] = useState({ name: "", phone: "", guests: 2, note: "" });
  const [loading, setLoading] = useState(false);

  // เช็คว่าเป็นการสั่งอาหารกลับบ้านอย่างเดียวหรือไม่
  const isTakeawayOnly = bookingDraft.bookingType === "food";

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return alert("กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน");
    setLoading(true);

    try {
      let res;

      // 🛑 แยกการยิง API
      if (isTakeawayOnly) {
        // กรณีสั่งอาหารอย่างเดียว (รับกลับบ้าน)
        if (cart.length === 0) throw new Error("ตะกร้าอาหารว่างเปล่า");
        res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: form.name,
            phone: form.phone,
            type: "takeaway",
            cart: cart
          })
        });
      } else {
        // กรณีจองโต๊ะ (มีหรือไม่มีอาหารก็ได้)
        res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingDraft,
            customerName: form.name,
            phone: form.phone,
            guests: form.guests,
            note: form.note,
            cart: cart
          })
        });
      }

      const textResponse = await res.text();
      let data;
      try { data = JSON.parse(textResponse); } catch (err) {
        throw new Error("เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง");
      }

      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      // เคลียร์ข้อมูลและไปหน้า Success
      clearCart();
      clearBookingDraft();
      // ดึง ID (หน้าโต๊ะใช้ data.id, หน้าอาหารใช้ data.orderId)
      router.push(`/success?id=${data.id || data.orderId}`);

    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col">
      <header className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex items-center">
        <button onClick={() => router.back()} className="p-2 text-[#A09880] hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-serif text-xl ml-2">{isTakeawayOnly ? "ยืนยันการสั่งอาหาร" : "ยืนยันการจองโต๊ะ"}</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-6">
        
        {/* ซ่อนกล่องข้อมูลโต๊ะ ถ้าเป็นการสั่งอาหารกลับบ้านอย่างเดียว */}
        {!isTakeawayOnly && (
          <div className="bg-[#141414] border border-[#2A2A2A] p-5 rounded-2xl">
            <h2 className="text-[#A09880] text-xs tracking-widest mb-3 uppercase">ข้อมูลการจองโต๊ะ</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[#A09880]">โต๊ะ</span><span className="font-bold text-[#C9A84C]">{bookingDraft.tableId}</span></div>
              <div className="flex justify-between"><span className="text-[#A09880]">โต๊ะ</span><span className="font-bold text-[#C9A84C]">{bookingDraft.tableName}</span></div>
              <div className="flex justify-between"><span className="text-[#A09880]">วันที่</span><span>{bookingDraft.date}</span></div>
              <div className="flex justify-between"><span className="text-[#A09880]">เวลา</span><span>{bookingDraft.startTime} - {bookingDraft.endTime}</span></div>
            </div>
          </div>
        )}

        {/* สรุปตะกร้าอาหาร (ถ้ามี) */}
        {cart.length > 0 && (
          <div className="bg-[#141414] border border-[#2A2A2A] p-5 rounded-2xl">
            <h2 className="text-[#A09880] text-xs tracking-widest mb-3 uppercase">{isTakeawayOnly ? "รายการอาหาร (รับกลับบ้าน)" : "รายการอาหารล่วงหน้า"}</h2>
            <div className="space-y-3">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm">{item.imageUrl} {item.name} <span className="text-[#A09880] ml-2">x{item.qty}</span></span>
                  <span className="text-[#C9A84C]">฿{item.price * item.qty}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-[#2A2A2A] flex justify-between font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-[#C9A84C] text-xl font-serif">฿{cartTotal()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ฟอร์มข้อมูลลูกค้า */}
        <div className="space-y-4">
          <input type="text" placeholder="ชื่อ-นามสกุล *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 focus:border-[#C9A84C] outline-none" />
          <input type="tel" placeholder="เบอร์โทรศัพท์ *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 focus:border-[#C9A84C] outline-none" />
          
          {/* ซ่อนช่องจำนวนคน ถ้าสั่งกลับบ้านอย่างเดียว */}
          {!isTakeawayOnly && (
            <div className="w-1/2">
              <label className="block text-sm text-[#A09880] mb-2">จำนวนคน</label>
              <select value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 focus:border-[#C9A84C] outline-none">
                {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} ท่าน</option>)}
              </select>
            </div>
          )}
          
          <textarea placeholder={isTakeawayOnly ? "หมายเหตุเพิ่มเติม (เช่น ไม่ใส่ผักชี, เผ็ดน้อย)" : "หมายเหตุเพิ่มเติม (แพ้อาหาร, ต้องการเก้าอี้เด็ก...)"} value={form.note} onChange={e => setForm({...form, note: e.target.value})} rows={3} className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 focus:border-[#C9A84C] outline-none" />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#C9A84C] text-[#0A0A0A] font-bold text-lg py-4 rounded-xl hover:bg-[#E8C878] transition shadow-lg shadow-[#C9A84C]/20 disabled:opacity-50 mt-4"
        >
          {loading ? "กำลังดำเนินการ..." : `✓ ยืนยัน${isTakeawayOnly ? "คำสั่งซื้อ" : "การจอง"}`}
        </button>

      </main>
    </div>
  );
}
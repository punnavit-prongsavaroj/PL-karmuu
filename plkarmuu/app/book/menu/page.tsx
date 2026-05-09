// app/book/menu/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { useMenus } from "@/hooks/useDatabase";

export default function MenuPage() {
  const router = useRouter();
  const { cart, addToCart, updateQty } = useAppStore();

// ✨ เพิ่ม 2 บรรทัดนี้เข้าไป (คำนวณสดๆ ทุกครั้งที่ตะกร้าขยับ)
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);  const menus = useMenus();
  
  // สร้าง State สำหรับกรองหมวดหมู่
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", "อาหารจานเดียว", "เครื่องดื่ม", "ของหวาน"];

  // กรองเมนูตามหมวดหมู่ที่เลือก
  const filteredMenus = menus.filter(m => activeCategory === "ทั้งหมด" || m.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col pb-28">
      <header className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 text-[#A09880] hover:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="font-serif text-xl ml-2">เลือกเมนูอาหาร</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* แถบเลือกหมวดหมู่ */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-all ${
                activeCategory === cat 
                  ? "bg-[rgba(201,168,76,0.15)] border-[#C9A84C] text-[#C9A84C]" 
                  : "bg-transparent border-[#2A2A2A] text-[#A09880] hover:border-[#A09880]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {menus.length === 0 && <div className="text-center text-[#A09880] mt-10">กำลังโหลดเมนู...</div>}
        
        {/* รายการอาหาร */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenus.map((m) => {
            const inCart = cart.find(c => c.id === m.id);
            return (
              <div key={m.id} className="bg-[#141414] border border-[#2A2A2A] p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition">
                <div className="flex items-center gap-4">
                  <div className="text-4xl bg-[#0A0A0A] w-16 h-16 rounded-xl flex items-center justify-center border border-[#2A2A2A]">
                    {m.imageUrl || "🍲"}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{m.name}</div>
                    <div className="text-[#C9A84C] font-medium">฿{m.price}</div>
                  </div>
                </div>
                
                {inCart ? (
                  <div className="flex items-center gap-3 bg-[#0A0A0A] px-2 py-1 rounded-lg border border-[#2A2A2A]">
                    <button onClick={() => updateQty(m.id as string, inCart.qty - 1)} className="text-[#C9A84C] text-xl px-2 w-8 hover:text-white">-</button>
                    <span className="font-bold text-center w-4">{inCart.qty}</span>
                    <button onClick={() => updateQty(m.id as string, inCart.qty + 1)} className="text-[#C9A84C] text-xl px-2 w-8 hover:text-white">+</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(m)}
                    className="w-10 h-10 rounded-full border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black transition text-xl font-bold"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* แถบสรุปตะกร้าลอยอยู่ด้านล่างสุด */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#141414] border-t border-[#C9A84C]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-[#A09880]">{totalItems} รายการในตะกร้า</div>
              <div className="font-serif text-2xl text-[#C9A84C] font-bold">฿{totalPrice}</div>
            </div>
            <button 
              onClick={() => router.push("/confirm")}
              className="bg-[#C9A84C] text-[#0A0A0A] font-bold px-8 py-3 rounded-xl hover:bg-[#E8C878] transition shadow-lg shadow-[#C9A84C]/20"
            >
              ดำเนินการต่อ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
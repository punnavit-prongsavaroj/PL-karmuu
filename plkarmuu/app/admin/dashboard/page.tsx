"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [tables, setTables] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [storeConfig, setStoreConfig] = useState({ 
    openTime: "11:00", 
    closeTime: "22:00",
    phone: "02-123-4567", // เบอร์ตั้งต้น
    lineOA: "https://line.me/R/ti/p/@your_oa_id" // ลิงก์ตั้งต้น
  });

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(user => { if (!user) router.push("/admin/login"); });
    const unsubT = onSnapshot(collection(db, "tables"), s => setTables(s.docs.map(d=>({id: d.id, ...d.data()}))));
    const unsubM = onSnapshot(collection(db, "menus"), s => setMenus(s.docs.map(d=>({id: d.id, ...d.data()}))));
    
    // เรียงคิวจองล่าสุดขึ้นก่อน
    const qRes = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    const unsubR = onSnapshot(qRes, s => setReservations(s.docs.map(d=>({id: d.id, ...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "settings", "store"), (d) => {
      if (d.exists()) setStoreConfig(d.data() as any);
    });
    return () => {unsubConfig(); unsubAuth(); unsubT(); unsubM(); unsubR(); }
  }, [router]);
  const saveStoreConfig = async () => {
    await setDoc(doc(db, "settings", "store"), storeConfig);
    alert("บันทึกเวลาเปิด-ปิดร้านสำเร็จ!");
  };
  // ฟังก์ชันเพิ่มโต๊ะใหม่ลง Database จริง
  const handleAddTable = async () => {
    const name = prompt("ชื่อโต๊ะ (เช่น A1):");
    const seats = prompt("จำนวนที่นั่ง:");
    if (name && seats) {
      await addDoc(collection(db, "tables"), { name, seats: Number(seats), zone: "A", status: "available" });
    }
  };

  // ฟังก์ชันเพิ่มเมนูใหม่ลง Database จริง
  // ฟังก์ชันเพิ่มเมนูใหม่ลง Database (อัปเกรดให้เลือกหมวดหมู่ได้)
  const handleAddMenu = async () => {
    const name = prompt("ชื่อเมนู (เช่น ผัดไทย, ชาเย็น, บิงซู):");
    if (!name) return;

    const price = prompt("ราคา (ตัวเลข):");
    if (!price || isNaN(Number(price))) return alert("ราคาต้องเป็นตัวเลข");

    // ให้แอดมินพิมพ์เลข 1, 2 หรือ 3 เพื่อเลือกหมวดหมู่
    const catChoice = prompt("เลือกหมวดหมู่ (พิมพ์ตัวเลข):\n1 = อาหารจานเดียว 🍲\n2 = เครื่องดื่ม 🥤\n3 = ของหวาน 🍰", "1");

    let category = "อาหารจานเดียว";
    let imageUrl = "🍲";

    // เปลี่ยนหมวดหมู่และรูปภาพตามเลขที่พิมพ์
    if (catChoice === "2") {
      category = "เครื่องดื่ม";
      imageUrl = "🥤";
    } else if (catChoice === "3") {
      category = "ของหวาน";
      imageUrl = "🍰";
    }

    // บันทึกลง Database
    await addDoc(collection(db, "menus"), { 
      name, 
      price: Number(price), 
      category: category, 
      available: true, 
      imageUrl: imageUrl 
    });

    alert(`เพิ่มเมนู "${name}" ลงในหมวด "${category}" เรียบร้อยแล้ว!`);
  };

  return (
    <div className="p-8 text-white min-h-screen bg-[#0A0A0A]">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl text-[#C9A84C] font-serif">ระบบจัดการ Aroi Thai</h1>
        <button onClick={()=> auth.signOut()} className="bg-red-900 px-4 py-2 rounded hover:bg-red-800 transition">ออกจากระบบ</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ================================== */}
        {/* ฝั่งซ้าย: จัดการการจอง */}
        {/* ================================== */}
        <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
          <h2 className="text-xl mb-6 text-[#C9A84C] font-bold">รายการจองล่าสุด</h2>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {reservations.map(r => (
              <div key={r.id} className="border border-[#2A2A2A] bg-[#0A0A0A] p-4 rounded-lg flex justify-between items-start">
                
                {/* ข้อมูลการจอง */}
                <div>
                  <div className="text-xs font-mono text-[#C9A84C] tracking-widest mb-1">
                    ID: {r.id.slice(0, 8).toUpperCase()}
                  </div>
                  <p className="text-lg">
                    <strong>{r.customerName}</strong> <span className="text-sm text-gray-400">({r.guests} ท่าน)</span>
                  </p>
                  <p className="text-sm text-[#A09880] mt-1">
                    📞 {r.phone} | 🪑 โต๊ะ: {r.tableName || r.tableId}
                  </p>
                  <p className="text-sm text-gray-400">
                    📅 {r.date} | ⏰ {r.startTime}-{r.endTime} น.
                  </p>
                  
                  {r.note && (
                    <p className="text-xs text-red-400 mt-2 bg-red-900/20 p-2 rounded">
                      * หมายเหตุ: {r.note}
                    </p>
                  )}
                </div>

                {/* สถานะและปุ่มกด */}
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded mb-3 inline-block
                    ${r.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 
                      r.status === 'confirmed' ? 'bg-green-900 text-green-300' : 
                      'bg-gray-800 text-gray-400'}`}>
                    {r.status === 'pending' ? 'รอยืนยัน' : r.status === 'confirmed' ? '✓ ยืนยันแล้ว' : 'ยกเลิก'}
                  </div>

                  {r.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "confirmed" })}
                        className="text-xs bg-[#4CAF7A] text-black font-bold px-3 py-2 rounded hover:bg-green-400 transition"
                      >
                        รับคิว
                      </button>
                      <button 
                        onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "cancelled" })}
                        className="text-xs bg-red-900/50 text-red-300 border border-red-900 px-3 py-2 rounded hover:bg-red-900 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
            {reservations.length === 0 && <p className="text-gray-500 text-center py-4">ยังไม่มีรายการจอง</p>}
          </div>
        </div>
        {/* กล่องตั้งค่าร้านค้า (เวลา, เบอร์, ไลน์) */}
          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
            <h2 className="text-xl text-[#C9A84C] font-bold mb-4">ตั้งค่าร้านค้า</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">เวลาเปิดร้าน</label>
                <input type="time" value={storeConfig.openTime} onChange={e => setStoreConfig({...storeConfig, openTime: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">เวลาปิดร้าน</label>
                <input type="time" value={storeConfig.closeTime} onChange={e => setStoreConfig({...storeConfig, closeTime: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">เบอร์โทรศัพท์</label>
                <input type="text" value={storeConfig.phone} onChange={e => setStoreConfig({...storeConfig, phone: e.target.value})} placeholder="เช่น 021234567" className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">ลิงก์ LINE</label>
                <input type="text" value={storeConfig.lineOA} onChange={e => setStoreConfig({...storeConfig, lineOA: e.target.value})} placeholder="https://line.me/..." className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
            </div>
            <button onClick={saveStoreConfig} className="bg-[#4CAF7A] text-black font-bold px-4 py-2 rounded hover:bg-green-400 w-full transition">บันทึกการตั้งค่า</button>
          </div>
        {/* ฝั่งขวา: จัดการโต๊ะและเมนู */}
        {/* ================================== */}
        <div className="space-y-8">
          
          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl text-[#C9A84C] font-bold">จัดการโต๊ะ</h2>
               <button onClick={handleAddTable} className="bg-[#C9A84C] text-[#0A0A0A] font-bold px-3 py-1.5 rounded hover:bg-[#E8C878]">+ เพิ่มโต๊ะ</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {tables.map(t => (
                <div key={t.id} className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-center">
                  <div className="text-xl font-serif text-[#C9A84C]">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.seats} ที่นั่ง</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl text-[#C9A84C] font-bold">จัดการเมนูอาหาร</h2>
               <button onClick={handleAddMenu} className="bg-[#C9A84C] text-[#0A0A0A] font-bold px-3 py-1.5 rounded hover:bg-[#E8C878]">+ เพิ่มเมนู</button>
            </div>
            <div className="space-y-2">
              {menus.map(m => (
                <div key={m.id} className="border border-[#2A2A2A] bg-[#0A0A0A] p-3 rounded-lg flex justify-between items-center">
                  <span className="font-bold">{m.imageUrl} {m.name}</span>
                  <span className="text-[#C9A84C]">฿{m.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
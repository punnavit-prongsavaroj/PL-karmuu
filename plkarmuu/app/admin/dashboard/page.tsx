"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase/config";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc 
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [tables, setTables] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  
  // State สำหรับการตั้งค่าร้านค้า
  const [storeConfig, setStoreConfig] = useState({ 
    openTime: "11:00", 
    closeTime: "22:00",
    phone: "02-123-4567",
    lineOA: "https://line.me/R/ti/p/@your_oa_id",
    lineAdminId: "" // ฟิลด์ใหม่สำหรับแจ้งเตือน Admin
  });

  useEffect(() => {
    // เช็คการ Login
    const unsubAuth = auth.onAuthStateChanged(user => { 
      if (!user) router.push("/admin/login"); 
    });

    // ดึงข้อมูลโต๊ะ
    const unsubT = onSnapshot(collection(db, "tables"), s => 
      setTables(s.docs.map(d=>({id: d.id, ...d.data()})))
    );

    // ดึงข้อมูลเมนู
    const unsubM = onSnapshot(collection(db, "menus"), s => 
      setMenus(s.docs.map(d=>({id: d.id, ...d.data()})))
    );
    
    // ดึงข้อมูลการจอง (เรียงล่าสุดขึ้นก่อน)
    const qRes = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
    const unsubR = onSnapshot(qRes, s => 
      setReservations(s.docs.map(d=>({id: d.id, ...d.data()})))
    );

    // ดึงการตั้งค่าร้านค้า
    const unsubConfig = onSnapshot(doc(db, "settings", "store"), (d) => {
      if (d.exists()) setStoreConfig(prev => ({ ...prev, ...d.data() }));
    });

    return () => {
      unsubConfig(); 
      unsubAuth(); 
      unsubT(); 
      unsubM(); 
      unsubR(); 
    }
  }, [router]);

  // ฟังก์ชันบันทึกการตั้งค่าร้านค้า
  const saveStoreConfig = async () => {
    try {
      await setDoc(doc(db, "settings", "store"), storeConfig);
      alert("บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว!");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // ฟังก์ชันเพิ่มโต๊ะ
  const handleAddTable = async () => {
    const name = prompt("ชื่อโต๊ะ (เช่น A1):");
    const seats = prompt("จำนวนที่นั่ง:");
    if (name && seats) {
      await addDoc(collection(db, "tables"), { 
        name, 
        seats: Number(seats), 
        zone: "A", 
        status: "available" 
      });
    }
  };

  // ฟังก์ชันเพิ่มเมนู
  const handleAddMenu = async () => {
    const name = prompt("ชื่อเมนู (เช่น ผัดไทย, ชาเย็น):");
    if (!name) return;

    const price = prompt("ราคา (ตัวเลข):");
    if (!price || isNaN(Number(price))) return alert("ราคาต้องเป็นตัวเลข");

    const catChoice = prompt("เลือกหมวดหมู่:\n1 = อาหารจานเดียว 🍲\n2 = เครื่องดื่ม 🥤\n3 = ของหวาน 🍰", "1");

    let category = "อาหารจานเดียว";
    let imageUrl = "🍲";

    if (catChoice === "2") { category = "เครื่องดื่ม"; imageUrl = "🥤"; }
    else if (catChoice === "3") { category = "ของหวาน"; imageUrl = "🍰"; }

    await addDoc(collection(db, "menus"), { 
      name, 
      price: Number(price), 
      category: category, 
      available: true, 
      imageUrl: imageUrl 
    });
    alert(`เพิ่มเมนู "${name}" เรียบร้อย!`);
  };

  return (
    <div className="p-8 text-white min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[#2A2A2A] pb-6">
        <div>
          <h1 className="text-3xl text-[#C9A84C] font-serif tracking-wide">Aroi Thai Management</h1>
          <p className="text-gray-500 text-sm">ระบบจัดการหลังบ้านและตั้งค่าระบบ</p>
        </div>
        <button 
          onClick={()=> auth.signOut()} 
          className="bg-red-900/20 text-red-400 border border-red-900 px-4 py-2 rounded hover:bg-red-900 hover:text-white transition"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ================================== */}
        {/* ฝั่งซ้าย: รายการจองล่าสุด */}
        {/* ================================== */}
        <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A] shadow-xl">
          <h2 className="text-xl mb-6 text-[#C9A84C] font-bold flex items-center gap-2">
            <span>📋</span> รายการจองล่าสุด
          </h2>
          
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {reservations.map(r => (
              <div key={r.id} className="border border-[#2A2A2A] bg-[#0A0A0A] p-4 rounded-lg flex justify-between items-start hover:border-[#C9A84C]/50 transition">
                <div>
                  <div className="text-[10px] font-mono text-[#C9A84C] tracking-widest mb-1 opacity-70">
                    ID: {r.id.slice(0, 8).toUpperCase()}
                  </div>
                  <p className="text-lg font-semibold">
                    {r.customerName} <span className="text-sm text-gray-500 font-normal">({r.guests} ท่าน)</span>
                  </p>
                  <p className="text-sm text-[#A09880] mt-1">
                    📞 {r.phone} | 🪑 โต๊ะ: {r.tableName || "ไม่ได้ระบุ"}
                  </p>
                  <p className="text-sm text-gray-400">
                    📅 {r.date} | ⏰ {r.startTime}-{r.endTime} น.
                  </p>
                  
                  {r.note && (
                    <p className="text-xs text-red-400 mt-2 bg-red-900/10 p-2 rounded border border-red-900/20">
                      * {r.note}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded mb-3 inline-block
                    ${r.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-900' : 
                      r.status === 'confirmed' ? 'bg-green-900/30 text-green-500 border border-green-900' : 
                      'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                    {r.status === 'pending' ? 'รอยืนยัน' : r.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิก'}
                  </div>

                  {r.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "confirmed" })}
                        className="text-xs bg-[#C9A84C] text-black font-bold px-3 py-2 rounded hover:bg-[#E8C878] transition"
                      >
                        รับคิว
                      </button>
                      <button 
                        onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "cancelled" })}
                        className="text-xs text-gray-400 hover:text-red-400 transition"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reservations.length === 0 && <p className="text-gray-600 text-center py-10 italic">ยังไม่มีรายการจองในระบบ</p>}
          </div>
        </div>

        {/* ================================== */}
        {/* ฝั่งขวา: ตั้งค่าร้านค้า / โต๊ะ / เมนู */}
        {/* ================================== */}
        <div className="space-y-8">
          
          {/* 1. ตั้งค่าร้านค้า (รวม LINE ADMIN ID) */}
          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A] shadow-xl">
            <h2 className="text-xl text-[#C9A84C] font-bold mb-6 flex items-center gap-2">
              <span>⚙️</span> ตั้งค่าร้านค้า & การแจ้งเตือน
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-gray-400 block mb-1">เวลาเปิดร้าน</label>
                <input type="time" value={storeConfig.openTime} onChange={e => setStoreConfig({...storeConfig, openTime: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">เวลาปิดร้าน</label>
                <input type="time" value={storeConfig.closeTime} onChange={e => setStoreConfig({...storeConfig, closeTime: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                <input type="text" value={storeConfig.phone} onChange={e => setStoreConfig({...storeConfig, phone: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">ลิงก์ LINE OA (ลูกค้า)</label>
                <input type="text" value={storeConfig.lineOA} onChange={e => setStoreConfig({...storeConfig, lineOA: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2 text-white focus:border-[#C9A84C] outline-none" />
              </div>
              
              {/* ส่วนใหม่: LINE Admin ID */}
              <div className="col-span-2 mt-2 pt-4 border-t border-[#2A2A2A]">
                <label className="text-xs text-[#C9A84C] font-bold block mb-1 uppercase tracking-widest">
                  LINE Admin User ID (เพื่อรับการแจ้งเตือน)
                </label>
                <input 
                  type="text" 
                  value={storeConfig.lineAdminId} 
                  onChange={e => setStoreConfig({...storeConfig, lineAdminId: e.target.value})} 
                  placeholder="เช่น U123456789abcdef..." 
                  className="w-full bg-[#0A0A0A] border border-[#C9A84C]/30 rounded p-2 text-white focus:border-[#C9A84C] outline-none placeholder:text-gray-700" 
                />
                <p className="text-[10px] text-gray-500 mt-1 italic">* ระบบจะใช้ ID นี้ในการส่งข้อความแจ้งเตือนเมื่อมีการจองใหม่เข้ามา</p>
              </div>
            </div>
            <button onClick={saveStoreConfig} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded w-full transition shadow-lg">
              บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>

          {/* 2. จัดการโต๊ะ */}
          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl text-[#C9A84C] font-bold">🪑 จัดการโต๊ะ</h2>
               <button onClick={handleAddTable} className="text-xs bg-[#C9A84C] text-[#0A0A0A] font-bold px-3 py-1.5 rounded hover:bg-[#E8C878]">+ เพิ่มโต๊ะ</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {tables.map(t => (
                <div key={t.id} className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-center hover:border-[#C9A84C]/40 transition">
                  <div className="text-lg font-serif text-[#C9A84C]">{t.name}</div>
                  <div className="text-[10px] text-gray-500">{t.seats} ที่นั่ง</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. จัดการเมนู */}
          <div className="bg-[#141414] p-6 rounded-xl border border-[#2A2A2A]">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl text-[#C9A84C] font-bold">🍱 จัดการเมนู</h2>
               <button onClick={handleAddMenu} className="text-xs bg-[#C9A84C] text-[#0A0A0A] font-bold px-3 py-1.5 rounded hover:bg-[#E8C878]">+ เพิ่มเมนู</button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {menus.map(m => (
                <div key={m.id} className="border border-[#2A2A2A] bg-[#0A0A0A] p-3 rounded-lg flex justify-between items-center group hover:border-[#C9A84C]/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.imageUrl}</span>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-[10px] text-gray-500">{m.category}</p>
                    </div>
                  </div>
                  <span className="text-[#C9A84C] font-mono font-bold">฿{m.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
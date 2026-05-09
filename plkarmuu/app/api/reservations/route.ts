// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { adminDb, FieldValue  } from "@/lib/firebase/admin";

// ฟังก์ชันช่วยแปลงเวลาเป็นนาที (เพื่อคำนวณว่าเวลาชนกันไหม)
function timeToMins(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
const { tableId, tableName, date, startTime, endTime, cart, customerName, phone, guests } = data;
    // 1. เช็คคิวซ้อน (เผื่อมีคนกดจองพร้อมกันในเสี้ยววินาที)
    const isAvailable = await adminDb.runTransaction(async (t) => {
      const snap = await t.get(
        adminDb.collection("reservations")
          .where("tableId", "==", tableId)
          .where("date", "==", date)
          .where("status", "in", ["pending", "confirmed"])
      );
      
      const newStart = timeToMins(startTime);
      const newEnd = timeToMins(endTime);

      for (const doc of snap.docs) {
        const r = doc.data();
        if (newStart < timeToMins(r.endTime) && newEnd > timeToMins(r.startTime)) {
          return false; // โต๊ะชนกัน
        }
      }
      return true;
    });

    if (!isAvailable) {
      return NextResponse.json({ error: "โต๊ะไม่ว่างในเวลานี้ โปรดเลือกเวลาอื่น" }, { status: 400 });
    }

    // 2. บันทึกข้อมูลการจองลง Firebase
    const resRef = adminDb.collection("reservations").doc();
    const batch = adminDb.batch();
    
    batch.set(resRef, {
      customerName, 
      phone, 
      guests, 
      tableId, 
      tableName, 
      date, 
      startTime, 
      endTime,
      status: "pending", 
      createdAt: FieldValue.serverTimestamp()
    });

    // ถ้าลูกค้ามีกดสั่งอาหารล่วงหน้ามาด้วย ให้บันทึกลงตาราง orders ด้วย
    if (cart && cart.length > 0) {
      const orderRef = adminDb.collection("orders").doc();
      const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      
      batch.set(orderRef, {
        reservationId: resRef.id, 
        customerName, 
        phone, 
        status: "pending", 
        totalAmount: total, 
        createdAt: FieldValue.serverTimestamp()
      });

      // บันทึกรายการอาหารแต่ละอย่าง
      cart.forEach((item: any) => {
        batch.set(orderRef.collection("items").doc(), {
          menuId: item.id, 
          menuName: item.name, 
          price: item.price, 
          qty: item.qty
        });
      });
    }

    // สั่งเซฟข้อมูลทั้งหมดพร้อมกัน!
    await batch.commit();

    // 3. ส่งแจ้งเตือนเข้า LINE แอดมิน (ใส่ try-catch กันระบบล่มถ้า LINE ผิดพลาด)
    // 3. ส่งแจ้งเตือนเข้า LINE แอดมิน
    try {
      // สร้างรายการอาหารแบบข้อความ (ถ้ามีสั่งมาด้วย)
      let orderListText = "";
      if (cart && cart.length > 0) {
        orderListText = "\n\n🍽️ รายการอาหารล่วงหน้า:\n";
        cart.forEach((item: any) => {
          orderListText += `- ${item.name} x${item.qty}\n`;
        });
        const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
        orderListText += `💰 ยอดรวมอาหาร: ฿${total}`;
      }

      // นำมารวมกับข้อความจองโต๊ะ
      const lineMsg = `🔔 จองโต๊ะใหม่!\n👤 ${customerName} (${guests} ท่าน)\n📞 ${phone}\n🪑 โต๊ะ: ${tableName || tableId}\n📅 ${date} | ${startTime}-${endTime} น.${orderListText}`;
      
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
        body: JSON.stringify({ to: process.env.LINE_ADMIN_USER_ID, messages: [{ type: "text", text: lineMsg }] })
      });
    } catch (lineError) {
      console.log("LINE Notification Error:", lineError);
    }

    // 4. ส่งคำตอบกลับไปบอกหน้าเว็บว่า "สำเร็จแล้วนะ!" พร้อมส่ง ID การจองไปให้
    return NextResponse.json({ success: true, id: resRef.id });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" }, { status: 500 });
  }
}
// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { adminDb, FieldValue  } from "@/lib/firebase/admin";
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { cart, customerName, phone, type = "takeaway", reservationId = null } = data;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "ตะกร้าสินค้าว่างเปล่า" }, { status: 400 });
    }

    // 1. คำนวณยอดรวมทั้งหมด
    const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);

    // 2. สร้าง Reference สำหรับเอกสารใหม่ใน Collection "orders"
    const orderRef = adminDb.collection("orders").doc();
    const batch = adminDb.batch();

    // 3. บันทึกข้อมูลหลักของออเดอร์
    batch.set(orderRef, {
      reservationId, // ถ้าพ่วงมากับการจองโต๊ะจะมี ID นี้
      customerName,
      phone,
      type, // "dine-in" (ทานที่ร้าน) หรือ "takeaway" (รับกลับ)
      status: "pending",
      totalAmount,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. บันทึกรายการอาหารแต่ละรายการลงใน Subcollection "items"
    cart.forEach((item: any) => {
      const itemRef = orderRef.collection("items").doc();
      batch.set(itemRef, {
        menuId: item.id,
        menuName: item.name,
        price: item.price,
        quantity: item.qty,
        subtotal: item.price * item.qty,
      });
    });

    // สั่งเซฟลงฐานข้อมูล
    await batch.commit();

    // 5. แจ้งเตือนเข้า LINE แอดมิน (ดัก Error ไว้เผื่อ LINE มีปัญหา)
    // 5. แจ้งเตือนเข้า LINE แอดมิน
    try {
      // สร้างรายการอาหารแบบข้อความ
      let orderListText = "\n\n🍽️ รายการอาหาร:\n";
      cart.forEach((item: any) => {
        orderListText += `- ${item.name} x${item.qty}\n`;
      });

      const lineMsg = `🥡 มีออเดอร์ใหม่ (รับกลับบ้าน)!\n👤 ${customerName}\n📞 ${phone}${orderListText}\n💰 ยอดรวม: ฿${totalAmount}`;
      
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
        body: JSON.stringify({ to: process.env.LINE_ADMIN_USER_ID, messages: [{ type: "text", text: lineMsg }] })
      });
    } catch (lineError) {
      console.log("LINE Notification Error:", lineError);
    }

    // ตอบกลับไปให้หน้าเว็บว่าสำเร็จ
    return NextResponse.json({ success: true, orderId: orderRef.id, totalAmount });

  } catch (error: any) {
    console.error("Orders API Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" }, { status: 500 });
  }
}
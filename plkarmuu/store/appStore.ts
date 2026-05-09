// store/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// โครงสร้างข้อมูลที่ต้องจำ
interface BookingDraft {
  bookingType: "table" | "food" | "both" | null;
  date: string;
  startTime: string;
  endTime: string;
  tableId: string;
  tableName: string; 
}

interface AppStore {
  // 1. ส่วนเก็บข้อมูลการจองโต๊ะ
  bookingDraft: BookingDraft;
  setBookingDraft: (data: Partial<BookingDraft>) => void;
  clearBookingDraft: () => void;

  // 2. ส่วนตะกร้าอาหาร 
  cart: any[];
  addToCart: (item: any) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: () => number; // นับจำนวนชิ้นในตะกร้า
  cartTotal: () => number; // คำนวณราคารวม
}

const initialDraft: BookingDraft = {
  bookingType: null, date: "", startTime: "", endTime: "", tableId: "", tableName: ""
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- Booking Draft ---
      bookingDraft: initialDraft,
      setBookingDraft: (data) => set((state) => ({ bookingDraft: { ...state.bookingDraft, ...data } })),
      clearBookingDraft: () => set({ bookingDraft: initialDraft }),

      // --- Cart ---
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return { cart: state.cart.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
        }
        return { cart: [...state.cart, { ...item, qty: 1 }] };
      }),
      updateQty: (id, qty) => set((state) => {
        if (qty <= 0) return { cart: state.cart.filter((i) => i.id !== id) };
        return { cart: state.cart.map((i) => i.id === id ? { ...i, qty } : i) };
      }),
      clearCart: () => set({ cart: [] }),
      
      // ✨ 2 ฟังก์ชันนี้ที่ทำให้เว็บคุณ Error (ตอนนี้เติมให้แล้วครับ)
      cartCount: () => get().cart.reduce((sum, item) => sum + item.qty, 0),
      cartTotal: () => get().cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
    }),
    { name: 'aroi-thai-storage' } // บันทึกลง LocalStorage (รีเฟรชเว็บตะกร้าไม่หาย)
  )
);
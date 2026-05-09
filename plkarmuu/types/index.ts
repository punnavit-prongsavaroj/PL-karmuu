import { Timestamp } from "firebase/firestore";

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Menu {
  id?: string;
  name: string;
  category: "อาหารจานเดียว" | "เครื่องดื่ม" | "ของหวาน";
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface Table {
  id?: string;
  name: string; // เช่น A1, B2
  seats: number;
  zone: "A" | "B" | "VIP";
  status: "available" | "disabled";
}

export interface Reservation {
  id?: string;
  customerName: string;
  phone: string;
  tableId: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  note?: string;
  status: ReservationStatus;
  createdAt?: Timestamp | any;
}
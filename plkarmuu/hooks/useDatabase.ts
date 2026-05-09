import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Menu, Table, Reservation } from "@/types";

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  useEffect(() => {
    const q = query(collection(db, "menus"), where("available", "==", true));
    return onSnapshot(q, (snap) => setMenus(snap.docs.map(d => ({ id: d.id, ...d.data() } as Menu))));
  }, []);
  return menus;
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  useEffect(() => {
    const q = query(collection(db, "tables"));
    return onSnapshot(q, (snap) => setTables(snap.docs.map(d => ({ id: d.id, ...d.data() } as Table))));
  }, []);
  return tables;
}

export function useBookedSlots(tableId: string, date: string) {
  const [slots, setSlots] = useState<{start: string, end: string}[]>([]);
  useEffect(() => {
    if (!tableId || !date) return;
    const q = query(collection(db, "reservations"), where("tableId", "==", tableId), where("date", "==", date), where("status", "in", ["pending", "confirmed"]));
    return onSnapshot(q, (snap) => setSlots(snap.docs.map(d => ({ start: d.data().startTime, end: d.data().endTime }))));
  }, [tableId, date]);
  return slots;
}
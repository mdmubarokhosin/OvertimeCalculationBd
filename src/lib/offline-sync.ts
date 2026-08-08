/**
 * Offline Sync System — অফলাইন ডাটা এন্ট্রি ও অটো সিঙ্ক
 *
 * কিভাবে কাজ করে:
 * 1. অফলাইনে এন্ট্রি যোগ/সম্পাদনা/মুছে ফেলা → localStorage এ সেভ হয়
 * 2. অনলাইন হলে → স্বয়ংক্রিয়ভাবে Firebase RTDB তে সিঙ্ক হয়
 * 3. সিঙ্ক সম্পন্ন → localStorage থেকে মুছে যায়
 */

import { addOvertimeEntry, updateOvertimeEntry, deleteOvertimeEntry } from './database-helpers';

export interface OfflineAction {
  id: string;
  uid: string;
  type: 'add' | 'update' | 'delete';
  monthKey: string;
  entryId?: string;
  entryData?: { date: string; overtimeHours: number; shiftHours: number; note: string };
  updateData?: { overtimeHours: number; shiftHours: number; note: string };
  timestamp: string;
}

const QUEUE_KEY = 'ot-offline-queue';

function readQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full — try removing old actions
    try {
      if (queue.length > 1) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
      }
    } catch {
      console.error('[OfflineSync] localStorage is full');
    }
  }
}

/** একটি অফলাইন অ্যাকশন localStorage এ সেভ করুন */
export function saveOfflineAction(action: OfflineAction): void {
  const queue = readQueue();
  queue.push(action);
  writeQueue(queue);
}

/** সমস্ত পেন্ডিং অফলাইন অ্যাকশন পড়ুন */
export function getOfflineQueue(): OfflineAction[] {
  return readQueue();
}

/** একটি অ্যাকশন localStorage থেকে সরান (সিঙ্কের পর) */
export function removeOfflineAction(id: string): void {
  writeQueue(readQueue().filter(a => a.id !== id));
}

/** একটি অ্যাকশন আপডেট করুন (offline edit-এ ব্যবহৃত) */
export function replaceOfflineAction(id: string, replacement: OfflineAction): void {
  writeQueue(readQueue().map(a => a.id === id ? replacement : a));
}

/** পেন্ডিং অ্যাকশন সংখ্যা */
export function getPendingCount(): number {
  return readQueue().length;
}

/** সমস্ত পেন্ডিং অ্যাকশন মুছে ফেলুন */
export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch { /* ignore */ }
}

/**
 * সমস্ত পেন্ডিং অ্যাকশন Firebase এ সিঙ্ক করুন
 * সফল হলে localStorage থেকে মুছে যায়
 */
export async function syncOfflineQueue(): Promise<{ success: number; failed: number }> {
  const queue = readQueue();
  if (!queue.length) return { success: 0, failed: 0 };

  let success = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      switch (action.type) {
        case 'add':
          if (action.entryData) {
            await addOvertimeEntry(action.uid, action.entryData);
          }
          break;
        case 'update':
          if (action.entryId && action.updateData) {
            await updateOvertimeEntry(action.uid, action.monthKey, action.entryId, action.updateData);
          }
          break;
        case 'delete':
          if (action.entryId) {
            await deleteOvertimeEntry(action.uid, action.monthKey, action.entryId);
          }
          break;
      }
      // সফল → localStorage থেকে সরান
      removeOfflineAction(action.id);
      success++;
    } catch (err) {
      console.error('[OfflineSync] Failed to sync action:', action.id, err);
      failed++;
    }
  }

  return { success, failed };
}

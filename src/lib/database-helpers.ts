import { ref, set, get, update, remove, push, onValue, off } from 'firebase/database';
import { db } from './firebase';

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: string;
  isActive: boolean;
  dutyStartTime: string;
  dutyHours: number;
  hourlyRate: number;
  otRate: number;
  photoURL?: string;
  lockedMonths?: string[];
  weeklyHolidayDays?: number[]; // JS day-of-week: 0=Sun, 1=Mon, ..., 6=Sat
  emailNotif?: boolean;
  salaryCycleDay?: number; // 1=default (1st-end), e.g. 25 means 25th to 24th
}

export interface OvertimeEntry {
  id: string;
  date: string;
  overtimeHours: number;
  shiftHours: number;
  note: string;
  createdAt: string;
  shiftStart?: string;
  shiftEnd?: string;
}

// User Profile
export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid'>): Promise<void> {
  await set(ref(db, `users/${uid}`), { ...data, uid });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `users/${uid}`));
  const data = snapshot.val();
  if (!data) return null;
  return data as UserProfile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await get(ref(db, 'users'));
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data) as UserProfile[];
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await update(ref(db, `users/${uid}`), data);
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await remove(ref(db, `users/${uid}`));
}

// Overtime Entries
export async function addOvertimeEntry(uid: string, entry: Omit<OvertimeEntry, 'id' | 'createdAt'>): Promise<string> {
  const entryRef = push(ref(db, `overtime/${uid}/${entry.date.substring(0, 7)}`));
  const id = entryRef.key!;
  await set(entryRef, { ...entry, id, createdAt: new Date().toISOString() });
  return id;
}

export async function updateOvertimeEntry(uid: string, monthKey: string, entryId: string, data: Partial<OvertimeEntry>): Promise<void> {
  await update(ref(db, `overtime/${uid}/${monthKey}/${entryId}`), data);
}

export async function deleteOvertimeEntry(uid: string, monthKey: string, entryId: string): Promise<void> {
  await remove(ref(db, `overtime/${uid}/${monthKey}/${entryId}`));
}

export async function getOvertimeEntries(uid: string, monthKey: string): Promise<OvertimeEntry[]> {
  const snapshot = await get(ref(db, `overtime/${uid}/${monthKey}`));
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data) as OvertimeEntry[];
}

export async function getAllOvertimeEntries(uid: string): Promise<OvertimeEntry[]> {
  const snapshot = await get(ref(db, `overtime/${uid}`));
  const data = snapshot.val();
  if (!data) return [];
  const allEntries: OvertimeEntry[] = [];
  Object.values(data).forEach((monthData: unknown) => {
    if (monthData && typeof monthData === 'object') {
      Object.values(monthData as Record<string, OvertimeEntry>).forEach((entry: OvertimeEntry) => {
        if (entry && entry.id) allEntries.push(entry);
      });
    }
  });
  return allEntries;
}

// Listen to overtime entries in real-time
export function subscribeOvertimeEntries(uid: string, monthKey: string, callback: (entries: OvertimeEntry[]) => void): () => void {
  const entriesRef = ref(db, `overtime/${uid}/${monthKey}`);
  onValue(entriesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    callback(Object.values(data) as OvertimeEntry[]);
  });
  return () => off(entriesRef);
}

// Subscribe to user profile in real-time
export function subscribeUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
  const userRef = ref(db, `users/${uid}`);
  onValue(userRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(userRef);
}

// ==================== APP CONFIG ====================

export async function getAppConfig(): Promise<Record<string, string>> {
  const snapshot = await get(ref(db, 'config'));
  return snapshot.val() || {};
}

export async function setAppConfig(data: Record<string, string>): Promise<void> {
  await update(ref(db, 'config'), data);
}

export function subscribeAppConfig(callback: (config: Record<string, string>) => void): () => void {
  const configRef = ref(db, 'config');
  onValue(configRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return () => off(configRef);
}

// Admin: Get all overtime data for a specific user
export async function getAdminOvertimeData(uid: string): Promise<Record<string, OvertimeEntry[]>> {
  const snapshot = await get(ref(db, `overtime/${uid}`));
  const data = snapshot.val();
  if (!data) return {};
  const result: Record<string, OvertimeEntry[]> = {};
  Object.entries(data).forEach(([monthKey, monthData]: [string, unknown]) => {
    if (monthData && typeof monthData === 'object') {
      result[monthKey] = Object.values(monthData as Record<string, OvertimeEntry>);
    }
  });
  return result;
}

// Month Lock (Feature #5)
export async function toggleMonthLock(uid: string, monthKey: string): Promise<boolean> {
  const snapshot = await get(ref(db, `users/${uid}`));
  const data = snapshot.val();
  if (!data) throw new Error('User not found');
  const lockedMonths: string[] = Array.isArray(data.lockedMonths) ? [...data.lockedMonths] : [];
  const idx = lockedMonths.indexOf(monthKey);
  if (idx >= 0) { lockedMonths.splice(idx, 1); } else { lockedMonths.push(monthKey); }
  await update(ref(db, `users/${uid}`), { lockedMonths });
  return idx < 0; // true = locked, false = unlocked
}



// ==================== FEATURE #12: CUSTOM HOLIDAYS ====================

export interface CustomHoliday {
  id: string;
  date: string;
  name: string;
  rate: number; // multiplier, e.g. 2 for double
}

export async function addCustomHoliday(holiday: Omit<CustomHoliday, 'id'>): Promise<string> {
  const entryRef = push(ref(db, 'holidays'));
  const id = entryRef.key!;
  await set(entryRef, { ...holiday, id });
  return id;
}

export async function deleteCustomHoliday(holidayId: string): Promise<void> {
  await remove(ref(db, `holidays/${holidayId}`));
}

export async function getCustomHolidays(): Promise<CustomHoliday[]> {
  const snapshot = await get(ref(db, 'holidays'));
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data) as CustomHoliday[];
}

export function subscribeCustomHolidays(callback: (holidays: CustomHoliday[]) => void): () => void {
  const entriesRef = ref(db, 'holidays');
  onValue(entriesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    callback(Object.values(data) as CustomHoliday[]);
  });
  return () => off(entriesRef);
}








// ==================== FEATURE #21: RATE CHANGE HISTORY ====================

export interface RateChangeLog {
  id: string;
  uid: string;
  field: 'hourlyRate' | 'otRate';
  oldValue: number;
  newValue: number;
  changedAt: string;
}

export async function addRateChangeLog(log: Omit<RateChangeLog, 'id'>): Promise<string> {
  const entryRef = push(ref(db, `rateHistory`));
  const id = entryRef.key!;
  await set(entryRef, { ...log, id });
  return id;
}

export async function getRateChangeHistory(uid: string): Promise<RateChangeLog[]> {
  const snapshot = await get(ref(db, 'rateHistory'));
  const data: Record<string, unknown> = snapshot.val() || {};
  if (!data) return [];
  const results: RateChangeLog[] = [];
  for (const key of Object.keys(data)) {
    const entry = data[key] as RateChangeLog;
    if (entry && entry.uid === uid) results.push(entry);
  }
  return results.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}


// ==================== FEATURE #27: ACTIVITY LOG ====================

export interface ActivityLog {
  id: string;
  uid: string;
  userName: string;
  action: 'add_entry' | 'edit_entry' | 'delete_entry' | 'login' | 'profile_update' | 'rate_change' | 'admin_edit_entry' | 'admin_add_entry' | 'admin_rate_set' | 'payment_status';
  details: string;
  timestamp: string;
  monthKey?: string;
}

export async function logActivity(data: Omit<ActivityLog, 'id'>): Promise<void> {
  const entryRef = push(ref(db, 'activityLogs'));
  await set(entryRef, { ...data, id: entryRef.key! });
}

export async function getActivityLogs(limit?: number): Promise<ActivityLog[]> {
  const snapshot = await get(ref(db, 'activityLogs'));
  const data = snapshot.val();
  if (!data) return [];
  let logs = Object.values(data) as ActivityLog[];
  logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (limit) logs = logs.slice(0, limit);
  return logs;
}


// ==================== FEATURE #30: PAYMENT STATUS ====================

export interface PaymentStatus {
  monthKey: string;
  status: 'paid' | 'unpaid';
  paidAt?: string;
  note?: string;
}

export async function setPaymentStatus(uid: string, monthKey: string, status: PaymentStatus): Promise<void> {
  await set(ref(db, `payments/${uid}/${monthKey}`), status);
}

export async function getPaymentStatuses(): Promise<Record<string, Record<string, PaymentStatus>>> {
  const snapshot = await get(ref(db, 'payments'));
  const data = snapshot.val();
  if (!data) return {};
  return data as Record<string, Record<string, PaymentStatus>>;
}

export async function getUserPaymentStatuses(uid: string): Promise<Record<string, PaymentStatus>> {
  const snapshot = await get(ref(db, `payments/${uid}`));
  const data = snapshot.val();
  if (!data) return {};
  return data as Record<string, PaymentStatus>;
}


// ==================== ADMIN ENTRY MANAGEMENT (#28) ====================

export async function adminAddOvertimeEntry(uid: string, entry: Omit<OvertimeEntry, 'id' | 'createdAt'>): Promise<string> {
  const entryRef = push(ref(db, `overtime/${uid}/${entry.date.substring(0, 7)}`));
  const id = entryRef.key!;
  await set(entryRef, { ...entry, id, createdAt: new Date().toISOString() });
  return id;
}

export async function adminDeleteOvertimeEntry(uid: string, monthKey: string, entryId: string): Promise<void> {
  await remove(ref(db, `overtime/${uid}/${monthKey}/${entryId}`));
}

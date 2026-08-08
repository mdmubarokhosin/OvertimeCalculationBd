import type { OvertimeEntry } from './database-helpers';

/** Lightweight class name merger — clsx + tailwind-merge replacement */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .flat()
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==================== DATE HELPERS ====================

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const bengaliDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

export function getMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${bengaliMonths[parseInt(month) - 1]} ${year}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** তারিখ নম্বর সহ পূর্ণ ফরম্যাট — যেমন: "রবি ১৫" */
export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return `${bengaliDays[d.getDay()]} ${parseInt(parts[2])}`;
}

/** শুধু বাংলা দিনের নাম */
export function getDayName(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return bengaliDays[d.getDay()];
}

export function isWeeklyHoliday(dateStr: string, weeklyHolidayDays?: number[]): boolean {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const days = weeklyHolidayDays && weeklyHolidayDays.length > 0 ? weeklyHolidayDays : [0];
  return days.includes(d.getDay());
}

/** @deprecated Use isWeeklyHoliday */
export function isSunday(dateStr: string): boolean {
  return isWeeklyHoliday(dateStr);
}

export const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

// ==================== MONEY HELPERS ====================

/** এক পয়সা পর্যন্ত সঠিক হিসাব — কোনো রাউন্ডিং নেই */
export function formatTaka(amount: number): string {
  if (amount === 0) return '৳0';
  const fixed = amount.toFixed(2);
  const cleaned = fixed.replace(/\.?0+$/, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `৳${parts.join('.')}`;
}

// ==================== OVERTIME CALCULATION ====================

/**
 * একটি এন্ট্রির টাকা হিসাব
 *
 * হিসাব নিয়ম:
 *   সাধারণ দিন: শিফট = ঘণ্টা × বেসিক রেট, OT = ঘণ্টা × OT রেট
 *   রবিবার:    শিফট = ঘণ্টা × 2 × বেসিক রেট (ডবল)
 *              OT    = ঘণ্টা × 2 × বেসিক রেট (ডবল, OT রেট নয়)
 *   এক পয়সা পর্যন্ত সঠিক, কোনো রাউন্ডিং নেই
 */
export interface EntryMoney {
  shiftMoney: number;
  otMoney: number;
  total: number;
}

export function calcEntryMoney(entry: OvertimeEntry, hourlyRate: number, otRate: number, weeklyHolidayDays?: number[]): EntryMoney {
  const sunday = isWeeklyHoliday(entry.date, weeklyHolidayDays);
  const shiftMoney = sunday
    ? entry.shiftHours * 2 * hourlyRate
    : entry.shiftHours * hourlyRate;
  const otMoney = sunday
    ? entry.overtimeHours * 2 * hourlyRate
    : entry.overtimeHours * otRate;
  return { shiftMoney, otMoney, total: shiftMoney + otMoney };
}

/**
 * একাধিক এন্ট্রি থেকে মাসিক সারসংক্ষেপ হিসাব
 */
export interface MonthSummary {
  totalOT: number;
  totalShift: number;
  avgOT: string;
  sundayShiftHours: number;
  sundayOTHours: number;
  sundayTotalHours: number;
  nonSundayShiftHours: number;
  nonSundayOTHours: number;
  shiftMoney: number;        // সাধারণ দিনের শিফট টাকা
  otMoney: number;           // সাধারণ দিনের OT টাকা
  sundayMoney: number;       // রবিবারের মোট টাকা (শিফট + OT × 2 × বেসিক)
  totalSalary: number;       // মোট বেতন
}

export function calcMonthSummary(entries: OvertimeEntry[], hourlyRate: number, otRate: number, weeklyHolidayDays?: number[]): MonthSummary {
  const totalOT = entries.reduce((sum, e) => sum + e.overtimeHours, 0);
  const totalShift = entries.reduce((sum, e) => sum + e.shiftHours, 0);
  const avgOT = entries.length > 0 ? (totalOT / entries.length).toFixed(1) : '0';

  const sundayEntries = entries.filter(e => isWeeklyHoliday(e.date, weeklyHolidayDays));
  const nonSundayEntries = entries.filter(e => !isWeeklyHoliday(e.date, weeklyHolidayDays));

  const sundayShiftHours = sundayEntries.reduce((sum, e) => sum + e.shiftHours, 0);
  const sundayOTHours = sundayEntries.reduce((sum, e) => sum + e.overtimeHours, 0);
  const sundayTotalHours = sundayShiftHours + sundayOTHours;

  const nonSundayShiftHours = nonSundayEntries.reduce((sum, e) => sum + e.shiftHours, 0);
  const nonSundayOTHours = nonSundayEntries.reduce((sum, e) => sum + e.overtimeHours, 0);

  const shiftMoney = nonSundayShiftHours * hourlyRate;
  const otMoney = nonSundayOTHours * otRate;
  const sundayMoney = sundayTotalHours * 2 * hourlyRate;
  const totalSalary = shiftMoney + otMoney + sundayMoney;

  return {
    totalOT, totalShift, avgOT,
    sundayShiftHours, sundayOTHours, sundayTotalHours,
    nonSundayShiftHours, nonSundayOTHours,
    shiftMoney, otMoney, sundayMoney, totalSalary,
  };
}

// ==================== DEBOUNCE ====================

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

// ==================== IMAGE HELPERS ====================

/** Resize an image file to max dimension and return base64 data URL */
export function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Upload image to ImgBB and return the direct image URL. Accepts File, Blob, or base64 string. */
export async function uploadToImgBB(file: File | Blob | string, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('key', apiKey);
  if (typeof file === 'string') {
    // base64 string — strip data URL prefix if present
    const base64 = file.includes(',') ? file.split(',')[1] : file;
    formData.append('image', base64);
  } else {
    // File or Blob — ensure it has a filename for FormData
    const f = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
    formData.append('image', f);
  }
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('ImgBB upload failed: ' + res.status);
  const json = await res.json();
  if (!json.data || !json.data.url) throw new Error('ImgBB returned no URL');
  return json.data.url as string;
}

// ==================== SALARY CYCLE HELPERS ====================

const bengaliDigits = ['\u09ee','\u09ef','\u09f0','\u09f1','\u09f2','\u09f3','\u09f4','\u09f5','\u09f6','\u09f7'];
export function toBengaliNum(n: number): string {
  return String(n).split('').map(c => bengaliDigits[parseInt(c)] || c).join('');
}

/** Get the cycle-adjusted month key for a date.
 *  cycleDay=1 returns normal \"YYYY-MM\".
 *  cycleDay=25, date=Jan 15 \u2192 cycle started Dec 25 \u2192 returns \"2024-12\" */
export function getCycleMonthKey(date: Date, cycleDay: number): string {
  if (!cycleDay || cycleDay <= 1) return getMonthKey(date);
  if (date.getDate() >= cycleDay) return getMonthKey(date);
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthKey(d);
}

/** Get the date range {start, end} for a cycle month */
export function getCycleRange(monthKey: string, cycleDay: number): { start: string; end: string } {
  const [year, month] = monthKey.split('-').map(Number);
  if (!cycleDay || cycleDay <= 1) {
    const daysInMonth = getDaysInMonth(year, month);
    return {
      start: `${year}-${String(month).padStart(2,'0')}-01`,
      end: `${year}-${String(month).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`,
    };
  }
  const start = `${year}-${String(month).padStart(2,'0')}-${String(cycleDay).padStart(2,'0')}`;
  const endD = new Date(year, month, cycleDay - 1); // day cycleDay-1 of NEXT month
  const end = `${endD.getFullYear()}-${String(endD.getMonth()+1).padStart(2,'0')}-${String(endD.getDate()).padStart(2,'0')}`;
  return { start, end };
}

/** Get display name for a cycle month */
export function getCycleMonthName(monthKey: string, cycleDay: number): string {
  if (!cycleDay || cycleDay <= 1) return getMonthName(monthKey);
  const [year, month] = monthKey.split('-').map(Number);
  const endD = new Date(year, month, cycleDay - 1);
  const sn = bengaliMonths[month - 1];
  const en = bengaliMonths[endD.getMonth()];
  const yr = endD.getFullYear();
  const yrStr = yr > year ? ` ${yr}` : ` ${year}`;
  return `${toBengaliNum(cycleDay)} ${sn} - ${toBengaliNum(endD.getDate())} ${en}${yrStr}`;
}

/** Calendar day object for cycle-aware calendar */
export interface CycleDay {
  date: string;       // \"2025-01-25\"
  day: number;        // 25
  monthLabel?: string; // short month name if different from main
  dayOfWeek: number;  // 0=Sun
}

/** Get calendar days array for a cycle period */
export function getCycleCalendarDays(monthKey: string, cycleDay: number): (CycleDay | null)[] {
  if (!cycleDay || cycleDay <= 1) {
    const [year, month] = monthKey.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const days: (CycleDay | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      days.push({ date: `${year}-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`, day: i, dayOfWeek: d.getDay() });
    }
    return days;
  }
  const { start, end } = getCycleRange(monthKey, cycleDay);
  const startD = new Date(start);
  const endD = new Date(end);
  const [year] = monthKey.split('-').map(Number);
  const mainMonth = parseInt(monthKey.split('-')[1]);
  const days: (CycleDay | null)[] = [];
  const startDOW = startD.getDay();
  for (let i = 0; i < startDOW; i++) days.push(null);
  const cur = new Date(startD);
  while (cur <= endD) {
    const m = cur.getMonth() + 1;
    const dateStr = `${cur.getFullYear()}-${String(m).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    const ml = m !== mainMonth ? bengaliMonths[m - 1].substring(0, 3) : undefined;
    days.push({ date: dateStr, day: cur.getDate(), monthLabel: ml, dayOfWeek: cur.getDay() });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Filter entries to only those within a cycle range */
export function filterEntriesForCycle<T extends { date: string }>(entries: T[], monthKey: string, cycleDay: number): T[] {
  if (!cycleDay || cycleDay <= 1) return entries;
  const { start, end } = getCycleRange(monthKey, cycleDay);
  return entries.filter(e => e.date >= start && e.date <= end);
}

/** Get month keys needed to fetch entries for a cycle */
export function getCycleFetchMonthKeys(monthKey: string, cycleDay: number): string[] {
  if (!cycleDay || cycleDay <= 1) return [monthKey];
  const [year, month] = monthKey.split('-').map(Number);
  const nextMK = getMonthKey(new Date(year, month - 1 + 1, 1));
  return [monthKey, nextMK];
}

/** Get absent days within a cycle */
export function getAbsentDaysForCycle(entries: { date: string }[], monthKey: string, cycleDay: number, weeklyHolidayDays?: number[]): string[] {
  const { start, end } = getCycleRange(monthKey, cycleDay);
  const startD = new Date(start);
  const endD = new Date(end);
  const entryDates = new Set(entries.map(e => e.date));
  const absent: string[] = [];
  const cur = new Date(startD);
  while (cur <= endD) {
    const ds = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    if (!isWeeklyHoliday(ds, weeklyHolidayDays) && !entryDates.has(ds)) {
      absent.push(ds);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return absent;
}

// ==================== WEEK & ABSENCE HELPERS (Features #9, #10) ====================

/**
 * Feature #9: সপ্তাহ নম্বর — বাংলাদেশে সপ্তাহ শনিবার থেকে শুরু
 * Saturday=0, Sunday=1, ..., Friday=6
 */
export function getWeekNumber(dateStr: string): number {
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dayOfMonth = d.getDate();
  const dayOfWeek = d.getDay();
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const firstDaySinceSat = (firstDay + 1) % 7;
  const totalDays = (dayOfMonth - 1) + firstDaySinceSat;
  return Math.floor(totalDays / 7) + 1;
}

/**
 * Feature #10: অনুপস্থিতির দিন তালিকা (রবিবার বাদ দিয়ে)
 */
export function getAbsentDays(entries: OvertimeEntry[], year: number, month: number, weeklyHolidayDays?: number[]): string[] {
  const daysInMonth = getDaysInMonth(year, month);
  const entryDates = new Set(entries.map(e => e.date));
  const absent: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!isWeeklyHoliday(dateStr, weeklyHolidayDays) && !entryDates.has(dateStr)) {
      absent.push(dateStr);
    }
  }
  return absent;
}

// ==================== FEATURE #12: HOLIDAY HELPER ====================

export interface HolidayInfo {
  isHoliday: boolean;
  name: string;
  rate: number;
}

/** Check if a date is a custom holiday */
export function getHolidayInfo(dateStr: string, holidays: { date: string; name: string; rate: number }[]): HolidayInfo {
  const h = holidays.find(hol => hol.date === dateStr);
  if (h) return { isHoliday: true, name: h.name, rate: h.rate };
  return { isHoliday: false, name: '', rate: 1 };
}

/** Check if a date is a special day (Sunday or holiday) with rate multiplier */
export function getDayRate(dateStr: string, holidays: { date: string; rate: number }[], weeklyHolidayDays?: number[]): number {
  if (isWeeklyHoliday(dateStr, weeklyHolidayDays)) return 2;
  const h = holidays.find(hol => hol.date === dateStr);
  return h ? h.rate : 1;
}

/** Get the name of a special day if applicable */
export function getSpecialDayName(dateStr: string, holidays: { date: string; name: string }[], weeklyHolidayDays?: number[]): string {
  if (isWeeklyHoliday(dateStr, weeklyHolidayDays)) return weeklyHolidayLabel(weeklyHolidayDays);
  const h = holidays.find(hol => hol.date === dateStr);
  return h ? h.name : '';
}

/** Calculate entry money with custom holiday support (Feature #12) */
export function calcEntryMoneyWithHoliday(entry: OvertimeEntry, hourlyRate: number, otRate: number, holidays: { date: string; rate: number }[], weeklyHolidayDays?: number[]): EntryMoney {
  const rate = getDayRate(entry.date, holidays, weeklyHolidayDays);
  const shiftMoney = entry.shiftHours * rate * hourlyRate;
  const otMoney = entry.overtimeHours * rate * hourlyRate; // holiday OT also uses basic rate
  return { shiftMoney, otMoney, total: shiftMoney + otMoney };
}

/** Calculate month summary with holiday support (Feature #12) */
export function calcMonthSummaryWithHoliday(entries: OvertimeEntry[], hourlyRate: number, otRate: number, holidays: { date: string; rate: number }[], weeklyHolidayDays?: number[]): MonthSummary {
  let totalOT = 0, totalShift = 0;
  let sundayShiftHours = 0, sundayOTHours = 0, sundayTotalHours = 0;
  let nonSundayShiftHours = 0, nonSundayOTHours = 0;
  let shiftMoney = 0, otMoney = 0, sundayMoney = 0;

  entries.forEach(e => {
    totalOT += e.overtimeHours;
    totalShift += e.shiftHours;

    const dayIsSunday = isWeeklyHoliday(e.date, weeklyHolidayDays);
    const holiday = holidays.find(h => h.date === e.date);
    const rate = dayIsSunday ? 2 : (holiday ? holiday.rate : 1);

    if (dayIsSunday) {
      sundayShiftHours += e.shiftHours;
      sundayOTHours += e.overtimeHours;
      sundayTotalHours += e.shiftHours + e.overtimeHours;
    } else if (holiday) {
      // Holiday hours count like Sunday (special)
      sundayShiftHours += e.shiftHours;
      sundayOTHours += e.overtimeHours;
      sundayTotalHours += e.shiftHours + e.overtimeHours;
    } else {
      nonSundayShiftHours += e.shiftHours;
      nonSundayOTHours += e.overtimeHours;
    }

    const sMoney = e.shiftHours * rate * hourlyRate;
    const oMoney = e.overtimeHours * rate * hourlyRate;

    if (dayIsSunday || holiday) {
      sundayMoney += sMoney + oMoney;
    } else {
      shiftMoney += sMoney;
      otMoney += oMoney;
    }
  });

  const avgOT = entries.length > 0 ? (totalOT / entries.length).toFixed(1) : '0';
  const totalSalary = shiftMoney + otMoney + sundayMoney;

  return {
    totalOT, totalShift, avgOT,
    sundayShiftHours, sundayOTHours, sundayTotalHours,
    nonSundayShiftHours, nonSundayOTHours,
    shiftMoney, otMoney, sundayMoney, totalSalary,
  };
}

// ==================== WEEKLY HOLIDAY HELPERS ====================

/** Full Bengali day names for UI display */
export const dayNamesFull = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

/** Get Bengali label for weekly holiday day(s) */
export function weeklyHolidayLabel(weeklyHolidayDays?: number[]): string {
  const days = weeklyHolidayDays && weeklyHolidayDays.length > 0 ? weeklyHolidayDays : [0];
  if (days.length === 1) return dayNamesFull[days[0]];
  return days.map(d => dayNamesFull[d]).join(', ');
}

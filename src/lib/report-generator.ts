import { OvertimeEntry } from './database-helpers';
import { calcEntryMoney, calcMonthSummary, formatDate, isSunday, formatTaka, getMonthName } from './utils';

export interface ReportData {
  entries: OvertimeEntry[];
  displayName: string;
  email: string;
  hourlyRate: number;
  otRate: number;
  monthKey: string;
  role?: string;
}

/* ============================================================
   Feature #3 — Monthly Salary PDF Report (HTML → Print/PDF)
   ============================================================ */

export function generateMonthlyReportHTML(data: ReportData): string {
  const { entries, displayName, email, hourlyRate, otRate, monthKey } = data;
  const summary = calcMonthSummary(entries, hourlyRate, otRate);
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const rows = sorted
    .map((e) => {
      const sun = isSunday(e.date);
      const m = calcEntryMoney(e, hourlyRate, otRate);
      return `<tr class="${sun ? 'sunday-row' : ''}">
  <td>${e.date}</td>
  <td>${formatDate(e.date)}${sun ? ' (রবি)' : ''}</td>
  <td>${e.shiftHours}</td>
  <td>${e.overtimeHours}</td>
  <td>${formatTaka(m.shiftMoney)}</td>
  <td>${formatTaka(m.otMoney)}</td>
  <td><strong>${formatTaka(m.total)}</strong></td>
  <td style="text-align:left;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.note || '—'}</td>
</tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8">
<title>মাসিক বেতন রিপোর্ট - ${getMonthName(monthKey)}</title>
<style>
@page{margin:10mm;size:A4}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Bengali',Arial,sans-serif;color:#333;padding:20px;font-size:13px}
.no-print{text-align:center;margin-bottom:14px}
.no-print button{padding:8px 22px;margin:0 5px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit}
.btn-print{background:#059669;color:#fff}
.btn-close{background:#e5e7eb;color:#333}
.hdr{text-align:center;border-bottom:3px solid #059669;padding-bottom:10px;margin-bottom:14px}
.hdr h1{color:#059669;font-size:20px}
.hdr p{color:#666;font-size:12px;margin-top:3px}
.info{display:flex;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:4px}
.info span{font-size:12px;color:#555}.info strong{color:#111}
.sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
.sc{border:1px solid #e5e7eb;border-radius:8px;padding:8px;text-align:center}
.sc .lb{font-size:10px;color:#888}.sc .vl{font-size:17px;font-weight:bold;color:#059669;margin-top:2px}
.sc.tot{border-color:#059669;background:#f0fdf4}.sc.tot .vl{font-size:20px}
.sc.sun .vl{color:#ea580c}
table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:14px}
th{background:#059669;color:#fff;padding:7px 4px;text-align:center;font-size:10px}
td{padding:5px 4px;border-bottom:1px solid #f0f0f0;text-align:center}
tr:nth-child(even){background:#fafafa}
.sunday-row{background:#fff7ed!important}.sunday-row td{color:#c2410c}
.tot-row td{background:#f0fdf4!important;font-weight:bold;border-top:2px solid #059669;font-size:12px}
.ftr{text-align:center;font-size:9px;color:#aaa;margin-top:16px;border-top:1px solid #eee;padding-top:8px}
@media print{.no-print{display:none!important}body{padding:0}}
</style></head><body>
<div class="no-print">
  <button class="btn-print" onclick="window.print()">\u{1F5A8} প্রিন্ট / PDF সেভ করুন</button>
  <button class="btn-close" onclick="window.close()">\u2715 বন্ধ করুন</button>
</div>
<div class="hdr"><h1>Overtime Tracker BD</h1><p>মাসিক বেতন রিপোর্ট</p></div>
<div class="info">
  <span>কর্মী: <strong>${displayName}</strong></span>
  <span>ইমেইল: <strong>${email}</strong></span>
  <span>মাস: <strong>${getMonthName(monthKey)}</strong></span>
</div>
<div class="info">
  <span>বেসিক রেট: <strong>${formatTaka(hourlyRate)}/ঘণ্টা</strong></span>
  <span>OT রেট: <strong>${formatTaka(otRate)}/ঘণ্টা</strong></span>
  <span>মোট এন্ট্রি: <strong>${entries.length} দিন</strong></span>
</div>
<div class="sgrid">
  <div class="sc tot"><div class="lb">মোট বেতন</div><div class="vl">${formatTaka(summary.totalSalary)}</div></div>
  <div class="sc"><div class="lb">শিফট টাকা</div><div class="vl">${formatTaka(summary.shiftMoney)}</div></div>
  <div class="sc"><div class="lb">OT টাকা</div><div class="vl">${formatTaka(summary.otMoney)}</div></div>
  <div class="sc sun"><div class="lb">রবিবার টাকা</div><div class="vl">${formatTaka(summary.sundayMoney)}</div></div>
</div>
<table><thead><tr>
  <th>তারিখ</th><th>দিন</th><th>Shift (ঘণ্টা)</th><th>OT (ঘণ্টা)</th><th>Shift টাকা</th><th>OT টাকা</th><th>মোট</th><th>নোট</th>
</tr></thead><tbody>
${rows}
<tr class="tot-row">
  <td colspan="2">মোট</td>
  <td>${summary.totalShift}</td><td>${summary.totalOT}</td>
  <td>${formatTaka(summary.shiftMoney)}</td><td>${formatTaka(summary.otMoney)}</td>
  <td>${formatTaka(summary.totalSalary)}</td><td></td>
</tr></tbody></table>
<div class="sgrid" style="grid-template-columns:repeat(4,1fr)">
  <div class="sc"><div class="lb">মোট শিফট ঘণ্টা</div><div class="vl">${summary.totalShift}</div></div>
  <div class="sc"><div class="lb">মোট OT ঘণ্টা</div><div class="vl">${summary.totalOT}</div></div>
  <div class="sc"><div class="lb">রবিবার ঘণ্টা</div><div class="vl" style="color:#ea580c">${summary.sundayTotalHours}</div></div>
  <div class="sc"><div class="lb">গড় OT/দিন</div><div class="vl">${summary.avgOT}</div></div>
</div>
<div class="ftr">Overtime Tracker BD — ওভারটাইম ক্যালকুলেশন সিস্টেম | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
</body></html>`;
}

/* ============================================================
   Feature #4 — Salary Slip (formal print-friendly)
   ============================================================ */

export function generateSalarySlipHTML(data: ReportData): string {
  const { entries, displayName, email, hourlyRate, otRate, monthKey } = data;
  const summary = calcMonthSummary(entries, hourlyRate, otRate);
  const now = new Date();
  const issueDate = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8">
<title>সালারি স্লিপ - ${getMonthName(monthKey)}</title>
<style>
@page{margin:12mm;size:A4}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Bengali',Arial,sans-serif;color:#222;padding:20px;font-size:13px}
.no-print{text-align:center;margin-bottom:14px}
.no-print button{padding:8px 22px;margin:0 5px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:inherit}
.btn-print{background:#059669;color:#fff}.btn-close{background:#e5e7eb;color:#333}
.slip{border:2px solid #059669;border-radius:10px;overflow:hidden;max-width:700px;margin:0 auto}
.slip-hdr{background:#059669;color:#fff;text-align:center;padding:14px 16px}
.slip-hdr h1{font-size:18px;letter-spacing:1px}.slip-hdr p{font-size:11px;opacity:.85;margin-top:2px}
.slip-body{padding:16px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:14px}
.fld{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ccc;font-size:12px}
.fld .k{color:#666}.fld .v{font-weight:600;color:#111}
.section-title{font-size:13px;font-weight:700;color:#059669;margin:12px 0 8px;padding-bottom:4px;border-bottom:2px solid #059669}
.earn-table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px}
.earn-table th{text-align:left;padding:6px 8px;background:#f0fdf4;color:#059669;font-size:11px;border-bottom:2px solid #059669}
.earn-table td{padding:6px 8px;border-bottom:1px solid #eee}
.earn-table .amt{text-align:right;font-weight:600}
.net-box{background:#059669;color:#fff;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin:16px 0}
.net-box .lbl{font-size:13px;opacity:.9}.net-box .amt{font-size:24px;font-weight:800}
.sig-row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px}
.sig-box{text-align:center}
.sig-line{border-top:1px solid #333;margin-top:40px;font-size:11px;color:#666}
.ftr{text-align:center;font-size:9px;color:#aaa;margin-top:16px;padding-top:8px;border-top:1px solid #eee}
@media print{.no-print{display:none!important}body{padding:0}.slip{border:2px solid #059669}}
</style></head><body>
<div class="no-print">
  <button class="btn-print" onclick="window.print()">\u{1F5A8} প্রিন্ট / PDF সেভ করুন</button>
  <button class="btn-close" onclick="window.close()">\u2715 বন্ধ করুন</button>
</div>
<div class="slip">
  <div class="slip-hdr">
    <h1>SALARY SLIP</h1>
    <p>সালারি স্লিপ — Overtime Tracker BD</p>
  </div>
  <div class="slip-body">
    <div class="two-col">
      <div class="fld"><span class="k">কর্মীর নাম</span><span class="v">${displayName}</span></div>
      <div class="fld"><span class="k">ইমেইল</span><span class="v">${email}</span></div>
      <div class="fld"><span class="k">মাস</span><span class="v">${getMonthName(monthKey)}</span></div>
      <div class="fld"><span class="k">ইস্যুর তারিখ</span><span class="v">${issueDate}</span></div>
    </div>

    <div class="section-title">হিসাব বিবরণ</div>
    <table class="earn-table">
      <thead><tr><th>বিবরণ</th><th>ঘণ্টা</th><th>রেট</th><th class="amt">টাকা</th></tr></thead>
      <tbody>
        <tr><td>সাধারণ দিনের শিফট</td><td>${summary.nonSundayShiftHours}</td><td>${formatTaka(hourlyRate)}/ঘণ্টা</td><td class="amt">${formatTaka(summary.shiftMoney)}</td></tr>
        <tr><td>সাধারণ দিনের OT</td><td>${summary.nonSundayOTHours}</td><td>${formatTaka(otRate)}/ঘণ্টা</td><td class="amt">${formatTaka(summary.otMoney)}</td></tr>
        <tr style="background:#fff7ed"><td>রবিবারের শিফট (x2)</td><td>${summary.sundayShiftHours}</td><td>${formatTaka(hourlyRate)} x 2</td><td class="amt">${formatTaka(summary.sundayShiftHours * 2 * hourlyRate)}</td></tr>
        <tr style="background:#fff7ed"><td>রবিবারের OT (x2)</td><td>${summary.sundayOTHours}</td><td>${formatTaka(hourlyRate)} x 2</td><td class="amt">${formatTaka(summary.sundayOTHours * 2 * hourlyRate)}</td></tr>
      </tbody>
    </table>

    <div class="net-box">
      <span class="lbl">নেট পে (মোট বেতন)</span>
      <span class="amt">${formatTaka(summary.totalSalary)}</span>
    </div>

    <div class="two-col" style="margin-top:8px">
      <div class="fld"><span class="k">মোট কাজের দিন</span><span class="v">${entries.length} দিন</span></div>
      <div class="fld"><span class="k">মোট ঘণ্টা</span><span class="v">${summary.totalShift + summary.totalOT} ঘণ্টা</span></div>
      <div class="fld"><span class="k">মোট শিফট</span><span class="v">${summary.totalShift} ঘণ্টা</span></div>
      <div class="fld"><span class="k">মোট OT</span><span class="v">${summary.totalOT} ঘণ্টা</span></div>
    </div>

    <div class="sig-row">
      <div class="sig-box"><div class="sig-line">কর্মীর স্বাক্ষর</div></div>
      <div class="sig-box"><div class="sig-line">অনুমোদনকারীর স্বাক্ষর</div></div>
    </div>
  </div>
  <div class="ftr">Overtime Tracker BD — স্বয়ংক্রিয়ভাবে তৈরি হয়েছে | ${issueDate}</div>
</div>
</body></html>`;
}

/* ============================================================
   Helper — open HTML in new tab for print/PDF
   ============================================================ */

export function openPrintWindow(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Fallback: create a link to download the HTML file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

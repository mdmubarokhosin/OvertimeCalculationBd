# OvertimeCalculationBD — Release Notes

## Version 1.0.0 — Initial Production Release
**Release Date:** August 2026

---

## Overview

OvertimeCalculationBD is a full-featured, production-ready **Overtime Tracking & Salary Calculation System** designed specifically for organizations operating in Bangladesh. Built with Next.js 16, Firebase Realtime Database, Tailwind CSS 4, and Chart.js, the application provides a comprehensive solution for managing employee overtime entries, calculating salaries with shift and overtime differentials, generating professional reports, and administering users — all through a modern, responsive, mobile-first interface with full Bengali language support.

---

## Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16.1 (Static Export) | React-based SSG for Cloudflare Pages deployment |
| Language | TypeScript 5 | Type-safe development across 4,550+ lines of source code |
| Styling | Tailwind CSS 4 | Utility-first CSS with dark/light mode support |
| Database | Firebase Realtime Database | Real-time data synchronization for users, entries, and config |
| Authentication | Firebase Authentication | Email/password-based user authentication with role management |
| Charts | Chart.js 4 + react-chartjs-2 | Interactive doughnut charts for income visualization |
| Spreadsheet | SheetJS (xlsx) | Real Excel (.xlsx) file generation for data export |
| Icons | Bootstrap Icons (local) | 50+ icons loaded from local `/public/bootstrap-icons/` directory |
| Deployment | Cloudflare Pages | Static HTML export via `output: "export"` |

### Project Structure

```
src/
├── app/
│   └── page.tsx              # Single-file architecture (~3,500 lines, all components)
├── lib/
│   ├── auth-context.tsx       # Firebase Auth context & provider
│   ├── database-helpers.ts    # Firebase RTDB CRUD, subscriptions, config management
│   ├── firebase.ts            # Firebase app initialization & config
│   ├── language-context.tsx   # Bengali/English translation context
│   ├── report-generator.ts    # Monthly report & salary slip HTML generation
│   └── utils.ts               # Calculation engine, date helpers, image utilities
└── public/
    ├── bootstrap-icons/      # Local Bootstrap Icons asset files
    └── _redirects             # Cloudflare Pages SPA redirect rules
```

---

## Feature List (30+ Features)

### Core Functionality

#### 1. Overtime Entry Management
- Add daily overtime entries with OT hours, shift hours, and notes
- Edit and delete existing entries with confirmation dialogs
- Real-time data synchronization across all connected clients
- Monthly data organization with quick month navigation

#### 2. Intelligent Salary Calculation Engine
- Separate hourly rates for regular shift and overtime
- Configurable weekly holiday rate (default: 2x multiplier)
- Custom holiday support with per-holiday rate multipliers
- Automatic calculation of shift earnings, OT earnings, and holiday earnings
- Real-time summary updates as entries are added or modified

#### 3. Interactive Calendar View
- Monthly calendar with visual indicators for entries, holidays, and absences
- Color-coded day types: regular, Sunday/weekly holiday, custom holiday
- Direct entry creation from calendar date selection
- Month lock status indicator on calendar

#### 4. Doughnut Chart Analytics (Chart.js)
- **Monthly Income Breakdown:** Interactive doughnut chart showing Shift, OT, and Holiday earnings distribution
- **Annual Salary Distribution:** 12-month doughnut chart with distinct colors per month
- Dark/light mode adaptive chart colors, tooltips, and legends
- Fully responsive — scales perfectly on mobile, tablet, and desktop

#### 5. Multi-Month Comparison
- Side-by-side comparison of current vs. previous month
- Percentage change indicators for total salary, OT hours, shift hours, and entry count
- Visual up/down arrows with color-coded change badges

#### 6. Weekly Summary
- Automatic week-by-week breakdown (Saturday-start, per Bangladesh standard)
- Per-week OT hours, shift hours, total hours, and earnings
- Quick overview of weekly productivity patterns

#### 7. Absenteeism Tracking
- Automatic detection of absent days (excluding weekly holidays and custom holidays)
- Date list of all absences for the current month
- Count summary for quick reference

#### 8. Annual Summary
- Year-over-year navigation with full 12-month salary visualization
- Aggregate statistics: total salary, total hours, holiday hours, total entries
- Per-month horizontal salary comparison with doughnut chart

### Advanced Features

#### 9. Copy Entry
- Duplicate any existing entry to a different date
- One-click operation with date picker
- Preserves OT hours, shift hours, and notes

#### 10. Bulk Entry Creation
- Date range selector for bulk overtime entry
- Configurable OT and shift hours for the entire range
- Automatic skip for weekly holidays and custom holidays (optional)
- Progress indicator during bulk creation

#### 11. CSV Import
- Paste CSV-formatted data directly into the import modal
- Automatic parsing of date, OT hours, shift hours, and notes
- Validation and error reporting for malformed data

#### 12. Excel Export
- Generate real `.xlsx` files using SheetJS
- Monthly overtime data with all entry details
- Formatted with headers, currency values, and date columns
- Direct download — no server required

#### 13. Custom Holiday Management
- Admin-managed custom holiday calendar
- Add holidays with name, date, and custom rate multiplier
- Real-time subscription for instant updates across all users
- Holiday indicators on calendar and entry forms

#### 14. Rate Change History
- Automatic logging of all rate changes with timestamps
- Full history view in a dedicated modal
- Audit trail for compliance and transparency

#### 15. Shift Time & Auto-Calculation
- Configurable shift start and end times per user
- Automatic OT calculation from shift times
- Configurable meal break deduction (default: 1 hour)
- Auto-fill shift hours when entering OT

### User Experience

#### 16. Dark/Light Mode
- System-aware dark mode detection on first visit
- Persistent theme preference (localStorage)
- Custom color palette: Light (`#FFFFFF/#F8F9FA` bg, `#212529` text), Dark (`#121212/#1E1E1E` bg, `#E0E0E0` text)
- Smooth transitions across all components

#### 17. Daily Notification Reminder
- Browser notification permission request (once per session)
- Automatic 9 PM reminder if no entry was made for the day
- Respects weekly holidays — no reminder on off days

#### 18. Profile Photo Upload (ImgBB CDN)
- Admin-controlled ImgBB API key stored in Firebase
- User profile photos uploaded to ImgBB CDN
- Automatic fallback to Base64 when no API key is configured
- Photos displayed across dashboard, admin panel, and salary slips
- 5MB max file size with automatic resize to 400px

#### 19. Separate Settings Page
- Dedicated full-screen settings page with 8 sections:
  - Profile photo, name change, password management
  - Rate configuration (hourly, OT) with live validation
  - Duty hours, shift start time, meal break
  - Weekly holiday selection (any day of the week)
  - Email notification toggle
  - Dark mode toggle
  - Account deletion with re-authentication
- Accessible via bottom navigation bar

#### 20. Bengali Language Support
- Full Bengali (বাংলা) interface for all labels, buttons, and messages
- Language context system for future multilingual expansion
- Bengali month names and day names
- Taka (৳) currency formatting

### Admin Panel (7 Tabs)

#### 21. Admin Dashboard
- Real-time statistics: total users, active users, total entries
- Recent user activity feed with quick actions
- System health overview

#### 22. User Management
- Complete user list with search and filter
- Activate/deactivate user accounts
- Delete users with confirmation
- Role management (user/admin toggle)
- Per-user rate setting modal
- Profile photo display for all users

#### 23. Admin Overtime Data
- View any user's overtime entries by month
- Add, edit, and delete entries on behalf of users
- Full entry detail view with all fields

#### 24. Consolidated Report
- Month-selectable consolidated report across all users
- Per-user salary summary with entry counts
- Print-ready formatted report generation

#### 25. Activity Logging
- Comprehensive audit trail of all user and admin actions
- Timestamped entries with user identification
- Filterable log view for security monitoring

#### 26. Bulk Salary Slip Generation
- One-click salary slip generation for all active users
- Individual per-user salary slip option
- Professional HTML-based salary slip with print support

#### 27. Admin Settings
- Centralized ImgBB API Key management
- Firebase-stored configuration for global app settings
- Real-time config sync to all connected clients

### Security & Data

#### 28. Month Lock System
- Admin can lock specific months to prevent data modification
- Visual lock indicators on calendar and entry forms
- User-facing lock notification with reason display

#### 29. Firebase Authentication
- Email/password registration and login
- Password change with re-authentication
- Password reset via email link
- Session persistence across browser restarts

#### 30. Responsive Mobile-First Design
- Bottom navigation bar for mobile usability
- Touch-optimized tap targets (minimum 44px)
- Adaptive layouts for phone, tablet, and desktop
- Safe area support for notched devices

---

## Deployment

- **Platform:** Cloudflare Pages
- **Build Mode:** Static Export (`output: "export"`)
- **Routing:** Single-page application with `/_redirects` fallback
- **Firebase:** Realtime Database (real-time sync) + Authentication
- **CDN:** Cloudflare global edge network for static assets

---

## Database Schema (Firebase Realtime Database)

```
users/{uid}
  ├─ uid, email, displayName, role, isActive, createdAt
  ├─ dutyStartTime, dutyHours, hourlyRate, otRate
  ├─ photoURL, lockedMonths[], weeklyHolidayDays[]
  └─ emailNotif

overtime/{uid}/{monthKey}/{entryId}
  ├─ id, date, overtimeHours, shiftHours, note, createdAt
  ├─ shiftStart?, shiftEnd?

holidays/{holidayId}
  ├─ name, date, rate

rateHistory/{logId}
  ├─ uid, userName, field, oldValue, newValue, timestamp

activityLogs/{logId}
  ├─ uid, userName, action, details, timestamp, monthKey?

paymentStatuses/{uid}/{monthKey}
  ├─ status: 'paid' | 'unpaid'

config/
  └─ imgbbApiKey
```

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Chrome / Safari (iOS & Android)

---

## Known Limitations

- Firebase Realtime Database is used (not Firestore) — suited for real-time sync but has different scaling characteristics than document-based databases
- Profile photos without ImgBB API key fall back to Base64 storage in the database, which increases payload size
- No offline mode — requires active internet connection for Firebase sync
- Single-page architecture (`page.tsx`) contains all components for simplicity, which may benefit from code splitting in future versions

---

## Credits

- **Framework:** [Next.js](https://nextjs.org/) by Vercel
- **Database & Auth:** [Firebase](https://firebase.google.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Charts:** [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.netlify.app/)
- **Spreadsheet:** [SheetJS](https://sheetjs.com/)
- **Icons:** [Bootstrap Icons](https://icons.getbootstrap.com/)

---

*OvertimeCalculationBD © 2026 — Built for Bangladesh workforce management.*
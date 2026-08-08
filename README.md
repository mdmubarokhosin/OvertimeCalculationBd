# OvertimeCalculationBD

<div align="center">

**ওভারটাইম ট্র্যাকিং ও ক্যালকুলেশন সিস্টেম**  
*Overtime Tracking & Salary Calculation System for Bangladesh*

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chart.js)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-Private-gray)]()

</div>

---

## What is OvertimeCalculationBD?

OvertimeCalculationBD is a comprehensive, production-ready web application for managing employee overtime tracking, salary calculation, and workforce administration. Designed specifically for organizations operating in Bangladesh, it provides a modern mobile-first interface with full Bengali language support, real-time data synchronization, and powerful analytics.

The system supports three user roles: **Employees** (track their own overtime), **Administrators** (manage all users and data), and the entire application is built as a single-page application deployable to Cloudflare Pages or any static hosting platform.

---

## Key Features

### For Employees
| Feature | Description |
|---|---|
| **Overtime Entry** | Add, edit, delete daily OT and shift hours with notes |
| **Smart Calculation** | Auto-calculates earnings with shift, OT, and holiday rates |
| **Calendar View** | Visual monthly calendar with entry indicators and holiday markers |
| **Doughnut Charts** | Interactive Chart.js doughnut charts for monthly and annual income |
| **Monthly Comparison** | Side-by-side current vs previous month with % change |
| **Weekly Summary** | Week-by-week breakdown (Saturday-start, Bangladesh standard) |
| **Absenteeism Tracker** | Auto-detects absent days excluding holidays |
| **Copy Entry** | Duplicate any entry to a different date |
| **Bulk Entry** | Create entries for a date range in one action |
| **CSV Import** | Paste CSV data to import entries quickly |
| **Excel Export** | Download real `.xlsx` spreadsheets with monthly data |
| **Profile Photo** | Upload photos via ImgBB CDN (admin-managed API key) |
| **Settings Page** | Dedicated page for rates, schedule, notifications, and account |
| **Dark/Light Mode** | System-aware theme with custom color palette |
| **Daily Reminder** | Browser notification at 9 PM if entry is missing |

### For Administrators
| Feature | Description |
|---|---|
| **Dashboard** | Real-time stats: users, entries, active accounts |
| **User Management** | Activate, deactivate, delete, and change user roles |
| **Rate Management** | Set per-user hourly and OT rates |
| **Overtime Admin** | Add, edit, delete any user's entries |
| **Consolidated Report** | Cross-user monthly report with salary summaries |
| **Activity Logs** | Full audit trail of all system actions |
| **Bulk Salary Slips** | Generate salary slips for all users at once |
| **Month Lock** | Lock specific months to prevent data modification |
| **Holiday Management** | Create custom holidays with custom rate multipliers |
| **Global Settings** | Manage ImgBB API key and app-wide configuration |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1 | React framework with static export |
| TypeScript | 5 | Type-safe development |
| Tailwind CSS | 4 | Utility-first styling with dark mode |
| Firebase RTDB | 12.x | Real-time database for all data |
| Firebase Auth | 12.x | Email/password authentication |
| Chart.js | 4.5 | Interactive doughnut charts |
| react-chartjs-2 | 5.3 | React wrapper for Chart.js |
| SheetJS (xlsx) | 0.18 | Excel file generation |
| Bootstrap Icons | — | 50+ icons (loaded locally) |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **Firebase** project with Realtime Database and Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd OvertimeCalculationBd

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication in Authentication > Sign-in method
3. Create a **Realtime Database** in Database > Realtime Database
4. Update `src/lib/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com"
};
```

### Production Build

```bash
npm run build
```

This generates a static `out/` directory suitable for deployment to Cloudflare Pages, Vercel, Netlify, or any static hosting.

### Deployment (Cloudflare Pages)

1. Push the code to a Git repository
2. Connect the repository to Cloudflare Pages
3. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node.js version:** 18+
4. Deploy — the `_redirects` file handles SPA routing automatically

---

## Project Structure

```
OvertimeCalculationBd/
├── src/
│   ├── app/
│   │   └── page.tsx              # All components (~3,500 lines)
│   ├── lib/
│   │   ├── auth-context.tsx       # Firebase Auth context
│   │   ├── database-helpers.ts    # Firebase RTDB CRUD operations
│   │   ├── firebase.ts            # Firebase initialization
│   │   ├── language-context.tsx   # Bengali/English i18n
│   │   ├── report-generator.ts    # Report & salary slip HTML
│   │   └── utils.ts               # Calculations, date helpers, utilities
│   └── public/
│       ├── bootstrap-icons/      # Local icon assets
│       └── _redirects             # SPA routing rules
├── next.config.ts                  # Static export configuration
├── tailwind.config.ts              # Tailwind CSS 4 config
├── tsconfig.json                   # TypeScript configuration
├── package.json
└── README.md
```

---

## Database Schema

The application uses Firebase Realtime Database with the following structure:

```
├── users/{uid}                    # User profiles
│   ├── uid, email, displayName
│   ├── role: 'user' | 'admin'
│   ├── hourlyRate, otRate
│   ├── dutyStartTime, dutyHours
│   ├── photoURL, lockedMonths[]
│   └── weeklyHolidayDays[], emailNotif
│
├── overtime/{uid}/{monthKey}/{id}  # Overtime entries
│   ├── date, overtimeHours, shiftHours
│   ├── note, createdAt
│   └── shiftStart?, shiftEnd?
│
├── holidays/{id}                  # Custom holidays (admin)
│   └── name, date, rate
│
├── rateHistory/{id}               # Rate change audit log
│   └── uid, field, oldValue, newValue, timestamp
│
├── activityLogs/{id}              # System activity log
│   └── uid, action, details, timestamp
│
├── paymentStatuses/{uid}/{monthKey}  # Payment tracking
│   └── status: 'paid' | 'unpaid'
│
└── config/                        # Global app configuration
    └── imgbbApiKey
```

---

## Environment Setup

### First Admin User

1. Register a new account through the app
2. In Firebase Realtime Database, manually set the user's `role` to `"admin"`:

```
users/{uid}/role = "admin"
```

3. Refresh the app — the admin panel will now be accessible

### ImgBB Image Upload (Optional)

1. Get a free API key from [api.imgbb.com](https://api.imgbb.com/)
2. In the Admin Panel, go to the **Settings** tab
3. Paste the API key and click **Save**
4. All user profile photos will now upload to ImgBB CDN automatically

Without this key, photos are stored as Base64 in the database (works but increases data size).

---

## Color Palette

| Mode | Background | Card/Section | Primary Text | Secondary Text |
|---|---|---|---|---|
| **Light** | `#FFFFFF` / `#F8F9FA` | `#FFFFFF` | `#212529` / `#000000` | `#6B7280` |
| **Dark** | `#121212` / `#1E1E1E` | `#1E1E1E` | `#E0E0E0` | `#9CA3AF` |

Accent color: Emerald (`#059669`) used consistently across both themes.

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |
| Mobile Chrome | 90+ |
| Mobile Safari | 15+ |

---

## Performance

- **Static Export:** No server-side rendering — all pages are pre-built HTML
- **Real-time Sync:** Firebase RTDB provides instant data updates without polling
- **Local Icons:** Bootstrap Icons loaded from `/public/` — no external CDN dependency
- **Lazy Chart Loading:** Chart.js components render only when the analytics tab is active
- **Optimized Builds:** Next.js 16 Turbopack compilation with automatic code splitting

---

## Security Considerations

- Firebase Authentication handles user sessions and password hashing
- Password changes require re-authentication (current password verification)
- Account deletion requires re-authentication
- Admin actions are logged in the activity log
- Month lock prevents unauthorized data modification
- Firebase Realtime Database rules should be configured for production:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    "overtime": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null"
      }
    },
    "holidays": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "config": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
```

---

## License

This project is proprietary software. All rights reserved.

---

*OvertimeCalculationBD — Built for Bangladesh workforce management.*
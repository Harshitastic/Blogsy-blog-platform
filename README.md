# Blogsy — Minimalist Immersive Blogging Platform

Blogsy is an elegant, simple, and clean minimalist blogging platform built with **Next.js 16 (Turbopack)**, **SQLite**, and **Prisma**. It features a modern light/dark mode design, interactive post liking, nested discussion sections, a bespoke rich text WYSIWYG editor with drag-and-drop cover image uploads, and client-side cookie JWT authentication.

---

## ✨ Features

- **🎨 Minimalist Design**: Clean light & dark theme configurations mapped to CSS variables (styled in Poppins typography).
- **🚀 Immersive Entrance**: High-immersion full-page introductory overlay greeting users on first visit with a grid canvas reveal and enter CTA.
- **📝 WYSIWYG Rich Text Editor**: Bespoke contentEditable text editor supporting Bold, Italic, Headings, Lists, Quotes, Codeblocks, Links, and drag-and-drop cover image uploads (saved locally).
- **🔒 JWT Authentication**: Secure register, login, logout flows using HTTP-only cookies and bcrypt password hashing. Checks and enforces unique usernames.
- **💬 Nested Discussions**: Instant comments feed on articles, with author permission checks allowing only comment creators or article authors to moderate.
- **❤️ Post Liking**: Interactive post liking system mapped to database constraints to prevent duplicate voting. Includes total post likes aggregates in the stats dashboard.
- **📊 Writer Dashboard**: Overview statistics grid for articles (draft vs. published counts, comments, and likes received) with quick management controls.

---

## 🛠️ Technology Stack

- **Core**: React 19, Next.js 16 (App Router + Turbopack)
- **Styling**: Vanilla CSS with modern custom utility variables (`globals.css`)
- **Database**: SQLite database run via Prisma 7 Client (configured with better-sqlite3 drivers)
- **Security**: JSON Web Tokens (JWT) signatures, Route Interceptors (`proxy.js`)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration
Initialize and sync the database schema:
```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client
Generate the type-safe client bindings:
```bash
npx prisma generate
```

### 5. Start Development Server
Run the local next server (defaulting to port `3000` or `3001` if busy):
```bash
npm run dev
```

### 6. Verify APIs programmatically
Verify all authentication, post CRUD, comment moderated deletions, and likes toggle endpoints:
```bash
node scratch/test-apis.js
```

---

## 👨‍💻 Author

Created by [harshitastic](https://github.com/harshitastic). Built with ❤️.

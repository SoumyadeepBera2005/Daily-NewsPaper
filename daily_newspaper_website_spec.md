# 📰 Daily Newspaper Hub — Product & UI Specification

## 1. Project Overview

Build a modern, responsive newspaper-reading website where users can **read newspapers online for free** and an admin can upload/manage daily newspaper PDFs.

The website should have two main roles:

- **User** — can browse and read newspapers.
- **Admin** — can log in, upload daily newspaper PDFs, manage newspapers, and read them.

The design should feel like a **premium digital newspaper platform**, not a generic dashboard.

### Primary goals

1. Free newspaper reading.
2. Bengali newspapers.
3. English newspapers.
4. Dedicated **UPSC / IAS Daily Preparation** section.
5. Automatic online newspaper fetching where legally/technically possible.
6. Admin PDF upload as a reliable fallback.
7. Excellent PDF reading experience.
8. Responsive UI for mobile, tablet and desktop.
9. Bright, clean, interactive UI — **do not use a black/dark-heavy theme**.

---

# 2. Important Copyright & Source Rule

Do **not** scrape, mirror, republish, or distribute copyrighted full newspapers without permission.

The application may:

- Fetch articles/headlines from sources that explicitly provide a legal API/feed.
- Store/display only content permitted by the source/license.
- Link users to the original publisher when full content cannot legally be hosted.
- Allow the admin to upload PDFs that the admin has the right/permission to distribute.
- Clearly show source attribution.

If a publisher does not provide a legal full-newspaper feed/API, use the **Admin PDF Upload** workflow instead.

---

# 3. User Roles

## 3.1 User

Users can:

- Register/login.
- Browse newspapers.
- Search newspapers.
- Filter by language.
- Filter by newspaper category.
- Open a newspaper.
- Read PDF inside the website.
- Zoom in/out.
- Navigate pages.
- View today's newspapers.
- View previous editions.
- Access UPSC/IAS daily news.
- Bookmark/favorite newspapers.
- View reading history.
- Switch light/comfortable reading modes.
- Use mobile responsive reader.

Users should NOT have:

- Admin dashboard access.
- Upload permission.
- Delete permission.
- Newspaper management permission.

---

## 3.2 Admin

Admin can:

- Login securely.
- Access Admin Dashboard.
- Upload newspaper PDFs.
- Add newspaper metadata.
- Edit newspaper metadata.
- Delete/disable newspapers.
- Publish/unpublish newspapers.
- Upload daily editions.
- Manage Bengali newspapers.
- Manage English newspapers.
- Manage UPSC/IAS content.
- See upload history.
- Search/filter uploaded newspapers.
- View basic analytics.
- Read uploaded newspapers.

### Admin upload metadata

Required fields:

- Newspaper name
- Language
- Category
- Edition date
- Description
- PDF file
- Publisher/source
- Published status

Optional:

- Newspaper logo
- Thumbnail
- Edition/City
- Tags

---

# 4. Main Sections

The homepage should contain a dynamic newspaper system plus a dedicated UPSC / IAS section.

## A. All Newspapers

The website must NOT be limited to Bengali and English.

Every newspaper language should have its own dynamically generated section.

Example:

```text
All Newspapers
│
├── Bengali
├── English
├── Hindi
├── Tamil
├── Telugu
├── Marathi
├── Gujarati
├── Punjabi
├── Malayalam
├── Kannada
├── Odia
├── Assamese
├── Urdu
└── Other Languages
```

The exact languages must be configurable by the admin.

### Dynamic Language System

Do not hard-code languages into the frontend.

Create a `languages` database table:

```text
id
name
code
native_name
is_active
display_order
created_at
updated_at
```

Examples:

```text
Bengali  → bn
English  → en
Hindi    → hi
Tamil    → ta
Telugu   → te
Marathi  → mr
Gujarati → gu
Punjabi  → pa
Malayalam → ml
Kannada  → kn
Odia     → or
Assamese → as
Urdu     → ur
```

Admin should be able to:

- Add a language.
- Edit a language.
- Enable/disable a language.
- Change display order.

When a new language is added, its section should automatically appear on the website.

### Language Section UI

Example:

```text
বাংলা সংবাদপত্র
[View All →]

[ Newspaper Card ] [ Newspaper Card ] [ Newspaper Card ]

हिंदी समाचार पत्र
[View All →]

[ Newspaper Card ] [ Newspaper Card ] [ Newspaper Card ]

Tamil Newspapers
[View All →]

[ Newspaper Card ] [ Newspaper Card ] [ Newspaper Card ]
```

Do not hard-code copyrighted newspaper content. Newspaper names and editions should be configurable by the admin.

---

## B. Newspaper Categories

Every language can contain multiple newspaper categories:

- National
- International
- State / Regional
- Local
- Business
- Sports
- Technology
- Entertainment
- Editorial
- Current Affairs
- Education
- Employment
- Other

The category list should also be configurable by the admin.

---

## C. UPSC / IAS Daily Preparation ⭐

This should be a special section designed for UPSC/IAS aspirants.

Include:

- Daily Current Affairs
- National News
- International Relations
- Polity
- Economy
- Environment
- Science & Technology
- Government Schemes
- Important Reports & Indexes
- Awards & Appointments
- Defence
- Geography
- Editorial Analysis
- Important Facts
- Prelims Points
- Mains Perspective
- Possible UPSC Questions

### UPSC daily page structure

```text
Today's UPSC Brief
│
├── Top 10 Important News
├── Prelims Facts
├── Mains Analysis
├── Important Government Schemes
├── International Affairs
├── Economy
├── Environment
├── Science & Technology
├── Editorial Analysis
└── Practice Questions
```

---

# 5. Homepage UI

## Header

Use a clean white header.

Left:

- Logo
- Newspaper icon
- Site name: "Daily News Hub"

Center/right:

- বাংলা
- English
- UPSC / IAS
- Search

Right:

- Login / Profile
- Admin login only if the current user is admin

### Header style

- White background
- Soft border
- Sticky on scroll
- Rounded controls
- Blue/indigo accent
- No black background

---

# 6. Hero Section

Create an attractive hero section:

```text
Read. Learn. Stay Updated.

Today's newspapers and UPSC current affairs
in one simple reading platform.

[ Browse Newspapers ] [ UPSC Daily ]
```

Use a soft gradient such as:

- Light blue
- Indigo
- White
- Very light purple

Avoid a dark/black hero.

Add a newspaper illustration/card stack.

---

# 7. Today's Newspapers Section

Show newspaper cards.

Example:

```text
Today's Newspapers

[ Bengali ] [ English ] [ UPSC ]

┌──────────────────────────┐
│  Newspaper Thumbnail     │
│                          │
│  Newspaper Name          │
│  বাংলা • 30 Aug 2026     │
│                          │
│  32 Pages                │
│                          │
│  [ Read Now → ]          │
└──────────────────────────┘
```

Card interactions:

- Hover lift
- Small shadow
- Thumbnail zoom
- Read button animation
- Bookmark icon
- Date badge

---

# 8. Newspaper Categories UI

Create horizontal category tabs:

```text
All | Bengali | English | Business | Sports | UPSC
```

On mobile, make the tabs horizontally scrollable.

Add filters:

- Date
- Language
- Category
- Publisher
- Latest/Oldest

---

# 9. Global Search & Filter System 🔎

The website must have a dedicated and powerful search section.

Main search box:

```text
🔍 Search newspaper, language, edition or topic...
```

The user can search by:

- Newspaper name
- Language
- Category
- Date
- Publisher
- Tags
- Edition
- City/Region where applicable

## Search UI

```text
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search newspapers, language, editions...                  │
└──────────────────────────────────────────────────────────────┘

Language:     [ All Languages ▼ ]
Newspaper:    [ All Newspapers ▼ ]
Category:     [ All Categories ▼ ]
Date:         [ Select Date ▼ ]
Publisher:    [ All Publishers ▼ ]

[ Search ] [ Clear Filters ]
```

### Language Search

The user can select any available language:

```text
All Languages
Bengali
English
Hindi
Tamil
Telugu
Marathi
Gujarati
Punjabi
Malayalam
Kannada
Odia
Assamese
Urdu
Other Languages
```

The language list must come dynamically from the database.

### Newspaper Search

The newspaper dropdown/search results should also be dynamic.

Example:

```text
Language: Bengali

Newspaper:
- Newspaper A
- Newspaper B
- Newspaper C
```

If the user changes:

```text
Language: Hindi
```

the newspaper list should automatically update to show available Hindi newspapers.

### Combined Search

Support combinations such as:

```text
Language = Hindi
Newspaper = Newspaper A
Category = Business
Date = 30 August 2026
```

or:

```text
Language = Bengali
Search = "sports"
```

### Search Results

Display:

```text
Search Results
24 newspapers found

┌──────────────────────────┐
│ Newspaper Thumbnail      │
│ Newspaper Name           │
│ Hindi • Sports           │
│ 30 August 2026           │
│                          │
│ [ Read Now → ]           │
└──────────────────────────┘
```

### Search Features

Implement:

- Debounced search.
- Instant filter updates.
- Pagination/infinite scroll.
- Sorting by newest/oldest.
- Empty state.
- Loading skeleton.
- Search history for logged-in users if desired.
- Mobile-friendly filter drawer.

### Search API

```http
GET /api/newspapers/search
```

Query parameters:

```text
q
language
languageCode
newspaper
category
date
publisher
page
limit
sort
```

Example:

```text
/api/newspapers/search?q=sports&language=Hindi&date=2026-08-30
```

The backend must perform the actual filtering. Do not download all newspaper records to the browser and filter everything only on the frontend.

Use database indexes for:

```text
language_id
category_id
edition_date
publisher
title
```

Use full-text search where supported for larger datasets.

---

# 10. PDF Reader

The PDF reader is one of the most important parts.

Use a proper browser PDF viewer/library such as:

- PDF.js
- react-pdf
- another reliable PDF rendering library

### Reader layout

Desktop:

```text
┌─────────────────────────────────────────────┐
│ ← Back    Newspaper Name       🔖           │
├─────────────────────────────────────────────┤
│                                             │
│              PDF PAGE                       │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  −   100%   +    ◀ Page 1 / 32 ▶            │
└─────────────────────────────────────────────┘
```

### Reader features

- Page navigation
- Zoom in
- Zoom out
- Fit width
- Fit page
- Fullscreen
- Page number
- Keyboard navigation
- Mobile swipe
- Previous/next page
- Search within PDF if supported

---

# 11. PDF Protection / Anti-Download Requirement

The UI should discourage casual downloading/copying, but this must NOT be presented as absolute security.

A browser-delivered PDF cannot be made completely impossible to save or capture. A determined user can still use browser developer tools, screenshots, screen recording, network inspection, or other methods.

Implement reasonable deterrents:

### Disable right click

```javascript
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
```

Prefer applying this only to the reader area rather than breaking the entire website.

### Disable common shortcuts where appropriate

Block:

- Ctrl + S
- Ctrl + U
- Ctrl + P

Do not interfere with normal accessibility or browser behavior unnecessarily.

### Do not expose a direct public PDF URL

Instead of:

```text
/uploads/newspaper.pdf
```

use a protected backend endpoint such as:

```text
/api/newspapers/{id}/stream
```

The backend should check authentication/authorization before serving the file.

### Recommended protection

- Store PDFs outside the public/static frontend directory.
- Authenticate the reader endpoint.
- Authorize access.
- Use short-lived signed URLs/tokens if appropriate.
- Add watermarking where legally appropriate.
- Disable the visible download button.
- Disable browser context menu inside the reader.
- Log suspicious access patterns.

### Important

Do not claim:

> "Download is impossible."

Instead show:

> "Downloading and redistribution are restricted."

---

# 12. Admin Dashboard UI

The admin dashboard should be bright and modern.

Suggested navigation:

```text
Dashboard
├── Overview
├── Upload Newspaper
├── Newspapers
├── Bengali
├── English
├── UPSC / IAS
├── Drafts
├── Published
├── Users
└── Settings
```

### Dashboard cards

```text
Today's Uploads      Published       Total Readers
     18                 15              2,480
```

Use clean cards with:

- White background
- Rounded corners
- Soft shadows
- Blue/indigo accent
- Small icons
- Charts where useful

No black dashboard.

---

# 13. Admin Upload Page

Create a drag-and-drop upload area:

```text
┌───────────────────────────────────────────┐
│                                           │
│        📄 Drop PDF here                   │
│                                           │
│        or                                 │
│                                           │
│        [ Choose PDF ]                     │
│                                           │
│        Maximum size: configurable         │
└───────────────────────────────────────────┘
```

After selecting:

```text
File: Anandabazar_30_08_2026.pdf
Size: 18.4 MB
Status: Ready ✓

[ Upload & Publish ]
```

Show:

- Upload progress
- Validation
- Success/error state
- PDF preview
- File size
- Number of pages if available

---

# 14. Automatic News Fetching

Create a modular source adapter system.

Architecture:

```text
Source Adapter
      ↓
Fetcher
      ↓
Validator
      ↓
Normalizer
      ↓
Database
      ↓
Frontend
```

Possible legal sources:

- RSS feeds
- Official publisher APIs
- Licensed news APIs
- Government feeds
- Public-domain/permissioned sources

Never build a system intended to bypass paywalls, robots restrictions, authentication, or publisher protections.

### Source status

Admin should see:

```text
Source             Status
--------------------------------
RSS Source A       ✓ Active
API Source B       ✓ Active
Publisher C        ⚠ Manual Upload
```

If automatic fetching fails:

```text
Automatic source unavailable.

Please upload today's PDF manually.
[ Upload Newspaper ]
```

---

# 15. UPSC Automation

Create a separate UPSC content pipeline.

Possible workflow:

```text
Legal News/API/RSS
        ↓
Relevant article detection
        ↓
UPSC topic classification
        ↓
Daily summary
        ↓
Prelims facts
        ↓
Mains perspective
        ↓
Admin review
        ↓
Publish
```

The admin should be able to review generated content before publication.

Do not automatically republish full copyrighted articles.

---

# 16. Database Design

Use a relational database such as MySQL/PostgreSQL.

## users

```text
id
name
email
password_hash
role
created_at
updated_at
```

Roles:

```text
USER
ADMIN
```

## languages

```text
id
name
code
native_name
is_active
display_order
created_at
updated_at
```

## categories

```text
id
name
slug
is_active
created_at
updated_at
```

## newspapers

```text
id
title
language_id
category_id
edition_date
description
publisher
source_type
pdf_storage_key
thumbnail_url
page_count
status
created_at
updated_at
```

## bookmarks

```text
id
user_id
newspaper_id
created_at
```

## reading_history

```text
id
user_id
newspaper_id
last_page
last_read_at
```

## news_sources

```text
id
name
type
url
language
active
last_fetched_at
created_at
```

## upsc_articles

```text
id
title
summary
category
source_url
published_date
prelims_points
mains_analysis
tags
status
created_at
updated_at
```

---

# 17. API Design

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Languages

```http
GET    /api/languages
POST   /api/admin/languages
PUT    /api/admin/languages/{id}
DELETE /api/admin/languages/{id}
```

## Categories

```http
GET    /api/categories
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

## Newspapers

```http
GET /api/newspapers
GET /api/newspapers/today
GET /api/newspapers/{id}
GET /api/newspapers/{id}/stream
GET /api/newspapers/search
```

Filters:

```text
q
language
languageCode
newspaper
category
date
publisher
page
limit
sort
```

## Admin

```http
POST   /api/admin/newspapers
PUT    /api/admin/newspapers/{id}
DELETE /api/admin/newspapers/{id}
PATCH  /api/admin/newspapers/{id}/publish
POST   /api/admin/newspapers/upload
```

## UPSC

```http
GET  /api/upsc/today
GET  /api/upsc/articles
POST /api/admin/upsc/articles
PUT  /api/admin/upsc/articles/{id}
DELETE /api/admin/upsc/articles/{id}
```

---

# 18. Security

Implement:

- Password hashing using bcrypt/Argon2.
- JWT or secure HTTP-only session cookies.
- Role-based authorization.
- Admin-only APIs.
- File type validation.
- File size validation.
- PDF malware/security scanning where possible.
- Rate limiting.
- Input validation.
- SQL injection protection.
- XSS protection.
- CSRF protection when using cookie-based authentication.
- Secure headers.
- HTTPS in production.

Never trust:

```text
role = ADMIN
```

from frontend/localStorage.

The backend must determine the user's role.

---

# 19. Frontend Technology

Recommended:

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React icons
- react-pdf / PDF.js
- Axios or Fetch API
- React Query/TanStack Query
- Framer Motion for subtle interactions

Do not use an unnecessarily complicated frontend stack.

---

# 20. Backend Technology

Recommended:

### Option A

```text
Node.js
Express.js
MySQL/PostgreSQL
JWT/HTTP-only cookies
Multer or equivalent upload middleware
```

### Option B

```text
Java Spring Boot
Spring Security
MySQL/PostgreSQL
JPA/Hibernate
```

Choose one backend architecture and keep it consistent.

---

# 21. Storage

Do not store large PDFs directly inside the frontend project.

Use:

```text
Frontend
    ↓
Backend
    ↓
Object/File Storage
```

Possible production storage:

- AWS S3
- Cloudflare R2
- Google Cloud Storage
- Azure Blob Storage
- Another secure object-storage service

For development:

```text
/server/storage/newspapers/
```

Keep this directory outside the public frontend folder.

---

# 22. Responsive Design

Must work well on:

- Desktop
- Laptop
- Tablet
- Android phone
- iPhone

Mobile navigation:

```text
Home
Newspapers
UPSC
Search
Profile
```

Use bottom navigation on mobile if it improves usability.

---

# 23. Visual Design System

## Color direction

Use a bright editorial theme.

Suggested palette:

```text
Background: #F7F9FC
Surface:    #FFFFFF
Primary:    #4F46E5
Secondary:  #0EA5E9
Accent:     #F59E0B
Text:       #172033
Muted:      #64748B
Border:     #E2E8F0
Success:    #16A34A
```

Avoid:

- Black backgrounds
- Neon colors
- Excessive gradients
- Excessive glassmorphism
- Overly rounded childish UI

Use moderate rounded corners such as:

```text
12px - 18px
```

---

# 24. Typography

Recommended:

- Inter for English UI.
- Noto Sans Bengali for Bengali content.
- Strong readable heading hierarchy.

Newspaper titles should look editorial.

Example:

```text
আজকের সংবাদপত্র
Today's Newspapers
UPSC Daily Brief
```

---

# 25. Interactive UI

Add polished micro-interactions:

- Card hover animation
- Button press feedback
- Smooth page transitions
- Skeleton loading
- Upload progress
- Toast notifications
- Empty states
- Error states
- Confirmation dialogs
- Bookmark animation
- Reader loading indicator
- Search suggestions

Keep animations fast and subtle.

---

# 26. Homepage Layout

Recommended:

```text
┌─────────────────────────────────────────────┐
│ HEADER                                      │
├─────────────────────────────────────────────┤
│                                             │
│ HERO                                        │
│ Read. Learn. Stay Updated.                 │
│                                             │
├─────────────────────────────────────────────┤
│ TODAY'S NEWSPAPERS                          │
│ [Bengali] [English] [UPSC]                 │
│                                             │
│ Newspaper Cards                             │
│                                             │
├─────────────────────────────────────────────┤
│ UPSC / IAS DAILY                            │
│                                             │
│ Current Affairs Cards                       │
│                                             │
├─────────────────────────────────────────────┤
│ BROWSE BY CATEGORY                           │
├─────────────────────────────────────────────┤
│ LATEST EDITIONS                              │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

# 27. Newspaper Detail Page

Show:

```text
Newspaper Name
বাংলা
30 August 2026
Publisher: [Publisher]

[ Read Newspaper ]

Pages: 32
Category: Bengali
```

Below:

```text
About this edition
Related editions
More newspapers
```

---

# 28. Empty States

Example:

```text
📰

No newspaper available for today.

The admin has not uploaded today's edition yet.

[ Browse Previous Editions ]
```

For automatic fetching failure:

```text
Today's automatic news source is unavailable.

Please check again later.
```

---

# 29. Error Handling

Show friendly messages.

Bad PDF:

```text
This PDF could not be processed.
Please contact the administrator.
```

Unauthorized:

```text
You don't have permission to access this page.
```

Missing newspaper:

```text
Newspaper not found.
```

Network error:

```text
Unable to load newspapers.
Please check your internet connection and try again.
```

---

# 30. Accessibility

Support:

- Keyboard navigation
- Focus indicators
- Screen-reader labels
- Proper semantic HTML
- Sufficient color contrast
- Alt text for images
- Accessible buttons
- Accessible forms
- Reduced-motion preference

Do not rely only on color to communicate status.

---

# 31. SEO

Public pages should have:

- Unique page title
- Meta description
- Open Graph metadata
- Semantic headings
- Structured URLs

Examples:

```text
/newspapers
/newspapers/bengali
/newspapers/english
/newspapers/2026-08-30
/upsc
/upsc/current-affairs
```

Do not expose private admin routes to search engines.

---

# 32. Admin Dashboard Analytics

Display:

- Today's uploaded newspapers
- Total newspapers
- Total readers
- Most-read editions
- Bengali vs English readership
- UPSC section views
- Recent uploads

Example:

```text
Readers This Week

Mon ███████
Tue █████████
Wed █████
Thu ██████████
Fri ████████
Sat ███████████
Sun █████████
```

---

# 33. Project Folder Structure

Recommended React + Node architecture:

```text
daily-news-hub/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Newspapers/
│   │   │   ├── NewspaperReader/
│   │   │   ├── UPSC/
│   │   │   ├── Login/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   │   ├── newspaperFetcher/
│   │   ├── upsc/
│   │   └── storage/
│   ├── uploads/
│   ├── config/
│   ├── app.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── README.md
└── .env.example
```

---

# 34. Important UX Decision

The homepage should prioritize **reading**, not administration.

A normal visitor should immediately see:

1. Today's newspapers.
2. Bengali newspapers.
3. English newspapers.
4. UPSC/IAS daily section.
5. Search.

The Admin functionality should remain behind secure authentication.

---

# 35. Suggested Navigation

Desktop:

```text
Logo

Home
All Newspapers
Languages
Categories
UPSC / IAS
Latest
Search

                         Login
```

The `Languages` menu should open dynamically:

```text
Languages
──────────────
বাংলা
English
हिन्दी
தமிழ்
తెలుగు
मराठी
ગુજરાતી
ਪੰਜਾਬੀ
മലയാളം
ಕನ್ನಡ
ଓଡ଼ିଆ
অসমীয়া
اردو
Other
```

The list must come from the database rather than being hard-coded.

Admin after login:

```text
Dashboard
Upload
Manage Newspapers
UPSC
Users
Analytics
Settings
```

---

# 36. Final Product Experience

The final product should feel similar to a polished modern news-reading platform:

- Clean
- Bright
- Fast
- Professional
- Responsive
- Easy to understand
- Bengali + English friendly
- UPSC aspirant friendly
- PDF-first reading experience
- Admin-controlled daily publishing

The primary CTA should always be:

**Read Today's Newspaper →**

The secondary CTA:

**UPSC Daily Brief →**

---

# 37. Development Priority

Build in this order:

### Phase 1 — Foundation

- React frontend
- Backend
- Database
- Authentication
- User/Admin roles

### Phase 2 — Newspaper System

- Newspaper CRUD
- Admin PDF upload
- Metadata
- Today's editions
- Categories

### Phase 3 — PDF Reader

- PDF.js/react-pdf
- Zoom
- Pagination
- Mobile reader
- Protected stream endpoint
- Casual download deterrents

### Phase 4 — UPSC

- UPSC dashboard
- Current affairs
- Categories
- Prelims/Mains sections
- Admin review

### Phase 5 — Automation

- RSS/API adapters
- Source management
- Fetch scheduler
- Failure fallback to admin upload

### Phase 6 — Polish

- Search
- Bookmarks
- Reading history
- Analytics
- SEO
- Accessibility
- Performance
- Security hardening

---

# 38. Non-Functional Requirements

Target:

- Fast first load.
- Lazy-load newspaper thumbnails.
- Lazy-load PDF pages.
- Compress thumbnails.
- Cache public metadata.
- Avoid loading entire PDFs into memory unnecessarily.
- Use streaming/range requests for PDFs.
- Validate all uploads.
- Keep secrets in environment variables.
- Never commit `.env`.
- Never expose storage credentials to the frontend.

---

# 39. Final Requirement Summary

Build a **free online newspaper reading platform** with:

✅ User login  
✅ Admin login  
✅ Newspapers in multiple languages  
✅ Separate dynamic section for every active language  
✅ Bengali newspapers  
✅ English newspapers  
✅ Hindi newspapers  
✅ Tamil newspapers  
✅ Telugu newspapers  
✅ Marathi newspapers  
✅ Gujarati newspapers  
✅ Punjabi newspapers  
✅ Malayalam newspapers  
✅ Kannada newspapers  
✅ Odia newspapers  
✅ Assamese newspapers  
✅ Urdu newspapers  
✅ Ability to add any future language from Admin  
✅ Global newspaper search  
✅ Search by language  
✅ Search by newspaper name  
✅ Search by category  
✅ Search by date  
✅ Search by publisher  
✅ Combined language + newspaper + category + date filters  
✅ UPSC/IAS daily section  
✅ Daily newspaper publishing  
✅ Admin PDF upload  
✅ Optional legal automatic source fetching  
✅ PDF reader  
✅ Zoom/page navigation  
✅ Responsive mobile reader  
✅ Right-click deterrent  
✅ Hidden public storage paths  
✅ Protected PDF streaming  
✅ Search  
✅ Filters  
✅ Bookmarks  
✅ Reading history  
✅ Admin dashboard  
✅ Upload progress  
✅ Analytics  
✅ Bright interactive UI  
✅ No black-heavy design  
✅ Bengali-friendly typography  
✅ Secure role-based backend  
✅ Copyright-aware source handling  

**Core principle:** If an online newspaper source legally allows automated access, integrate it through a source adapter. Otherwise, the admin uploads the authorized PDF manually and users read it through the protected in-browser reader.

# YouTube Filename Cleaner 🎬

A small Chrome extension + Node/Express backend that helps YouTube creators clean messy video filenames **before uploading**.

Creators often have raw files like:
`final_final_v3 (2).mp4`

This tool converts them into clean, consistent upload names like:
`techreview_iphone_17_camera_test_2025-11-30.mp4`

---

## ✨ Features
- **Cleans messy filenames**
  - removes junk words: `final`, `copy`, `v2`, `draft`, `export`, etc.
  - removes duplicate separators, brackets, extra spaces
- **Naming templates**
  - example: `{niche}_{title}_{date}`
  - example: `{niche}_Ep{episode}_{date}`
- **Auto episode numbering**
  - keeps per-niche counters in DB
- **Chrome extension UI**
  - one click clean + copy result
- **Per-user settings**
  - templates and removal rules stored in Postgres

---

## 🛠 Tech Stack
**Backend**
- Node.js + Express
- PostgreSQL
- Prisma ORM

**Extension**
- Chrome Extension (Manifest v3)
- Vanilla JS, HTML, CSS

---

## 📁 Project Structure

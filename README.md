```markdown
# 🔍 LinkedIn Job Applicants Scraper (Electron App)

This is a cross-platform Electron application that runs **locally** on your system and lets you scrape **job applicants’ details** from jobs **you have posted on LinkedIn**.

---

## 🚀 Features

- Electron app with a built-in backend (Node.js + Express + Puppeteer)
- Secure LinkedIn login using a built-in Chromium browser
- Automatically navigates to your posted jobs list
- Scrapes all job listings you've posted
- Displays them in the UI
- You can select one job, and it will:
  - Scrape the **email, name, phone number**, and **resume PDF** of all applicants
- Everything is displayed in a clean UI
- No LinkedIn credentials are stored anywhere

---

## 🛠 Tech Stack

- **Electron** – Desktop app framework
- **Puppeteer** – Headless browser automation
- **Node.js + Express** – Local server for backend logic
- **React + MUI** – Frontend interface
- **MongoDB Atlas** – Stores scraped applicant data (optional)

---

## 📦 Setup Instructions

### ✅ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Git](https://git-scm.com/)
- MongoDB Atlas account (or any MongoDB instance)

---

### 🔧 1. Clone the Repository

```bash
git clone https://github.com/your-username/Zscraper.git
cd Zscraper
```

---

### 🔐 2. Configure Environment Variables

Create a `.env` file in the root folder and add your MongoDB connection string:

```env
DB_URL="your_mongodb_atlas_connection_string"
```

---

### 📦 3. Install Dependencies

```bash
npm install
```

---

### 🛠️ 4. Add Your MongoDB Atlas URL

Make sure your `.env` file at the root has the correct MongoDB connection string:

```env
DB_URL="your_mongodb_atlas_connection_string"
```

---

### ⚙️ 5. Build the Frontend

```bash
npm run build
```

---

### 🚀 6. Run the App in Development Mode

```bash
npm run dev:electron
```

---

## 📂 Folder Structure (Simplified)

```
Zscraper/
│
├── src/
│   ├── electron/         # Electron main process files
│   ├── server/           # Express + Puppeteer backend
│   └── frontend/         # React UI
│
├── .env                  # MongoDB connection string
├── package.json
└── README.md
```

---

## 📍 Notes

- The backend server runs locally on port `1235`.
- Puppeteer uses a stealth plugin to avoid bot detection.
- All scraping is done **using your system's IP**, not from a cloud server.
- No data is sent outside your machine unless you explicitly configure MongoDB Atlas.

---

## 📦 Packaging and Zipping

### 🍏 macOS (Apple Silicon)

```bash
npx electron-packager . Zscraper --platform=darwin --arch=arm64 --overwrite
zip -r Zscraper-mac.zip Zscraper-darwin-arm64/
```

- Output folder: `Zscraper-darwin-arm64`
- Final zip: `Zscraper-mac.zip`

---

### 🪟 Windows (x64)

```bash
npx electron-packager . Zscraper --platform=win32 --arch=x64 --overwrite
tar.exe -a -c -f Zscraper-windows.zip Zscraper-win32-x64
```

- Output folder: `Zscraper-win32-x64`
- Final zip: `Zscraper-windows.zip`

> 💡 If `tar.exe` is not available, use the Windows "Send to → Compressed (zipped) folder" option.

---

Happy scraping! 🧃
```

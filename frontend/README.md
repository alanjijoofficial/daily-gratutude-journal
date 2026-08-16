# 🌸 Daily Gratitude Journal — Frontend (React)

A mindful, calming frontend for the **Daily Gratitude Journal** built with **Pure React (React 18)**, **react-scripts**, and modern **Vanilla CSS**.

---

## ✨ Features
* **Mindful User Experience**: Editorial typography (**Lora** and **Plus Jakarta Sans**) and serene earthy color palette.
* **Interactive Calendar**: Monthly navigation with visual badges for days with completed reflections.
* **Daily Reflection Hero Card**: Automatic today-detection with prompt and quick quote preview.
* **Reflective Journal Editor**: Support for custom titles/themes, 1,000-character counter, and confirmation modals.
* **Timeline & Search**: Recent entries feed and searchable modal across titles and text.
* **Authentication**: Seamless Registration and Login with token persistence.

---

## 🛠️ Tech Stack
* **React 18.3.1**
* **React DOM 18.3.1**
* **react-scripts 5.0.1**
* **Vanilla CSS (Design Tokens & Utility Architecture)**
* **Custom Pure React SVG Icons**

---

## 📦 Setup & Installation

### 1. Clone & Navigate
```bash
git clone https://github.com/YOUR_USERNAME/daily-gratitude-journal-frontend.git
cd daily-gratitude-journal-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows: `copy .env.example .env`)*

Ensure `REACT_APP_API_URL` points to your Django backend (default: `http://127.0.0.1:8000/api`).

### 4. Start Development Server
```bash
npm start
```
The app will open automatically at **`http://localhost:3001`** (or `http://localhost:3000`).

---

## 🏗️ Production Build
```bash
npm run build
```
Generates an optimized production build in the `build/` folder.

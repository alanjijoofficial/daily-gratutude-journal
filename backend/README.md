# 🌿 Daily Gratitude Journal — Backend API

Backend REST API for the **Daily Gratitude Journal** application, built using **Django 5.2** and **Django REST Framework (DRF)** with token-based authentication and SQLite.

---

## 🚀 Features
* **Token-Based Authentication**: Secure Registration, Login, Logout, and User Info endpoints.
* **Strict Privacy Isolation**: Every query is scoped to the authenticated user. Users can never view or modify another user's reflections.
* **One Entry Per Day Rule**: Database-level unique constraint (`owner` + `date`) with serializer validation.
* **Entries with Titles**: Full CRUD operations for journal entries with titles, dates, and reflections.
* **Django Admin**: Admin management interface for superusers.

---

## 🛠️ Tech Stack
* **Python 3.12+**
* **Django 5.2**
* **Django REST Framework (DRF)**
* **django-cors-headers**
* **python-dotenv**
* **SQLite**

---

## 📦 Setup & Installation

### 1. Clone & Navigate
```bash
git clone https://github.com/YOUR_USERNAME/daily-gratitude-journal-backend.git
cd daily-gratitude-journal-backend
```

### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows: `copy .env.example .env`)*

### 5. Run Database Migrations
```bash
python manage.py migrate
```

### 6. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 7. Run the Development Server
```bash
python manage.py runserver 127.0.0.1:8000
```
API root will be live at: **`http://127.0.0.1:8000/api/`**

---

## 🧪 Running Unit Tests
```bash
python manage.py test journal
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/` | Interactive API Root | No |
| `POST` | `/api/register/` | Register new account | No |
| `POST` | `/api/login/` | Log in and receive Token | No |
| `POST` | `/api/logout/` | Invalidate current Token | Yes |
| `GET` | `/api/me/` | Current user profile info | Yes |
| `GET` | `/api/entries/` | List user's journal entries | Yes |
| `POST` | `/api/entries/` | Create gratitude entry | Yes |
| `GET` | `/api/entries/<id>/` | Retrieve entry by ID | Yes |
| `PUT` | `/api/entries/<id>/` | Update entry | Yes |
| `DELETE` | `/api/entries/<id>/` | Delete entry | Yes |

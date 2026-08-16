# 🌱 Daily Gratitude Journal

A complete, full-stack web application for private daily gratitude journaling and mindfulness reflection. Built with a **Django REST Framework** backend and a responsive **React (Vite)** frontend.

The app encourages users to take a quiet pause each day and write **one thoughtful paragraph about something they appreciate**.

---

## 🌟 Key Features

* **Reflective Journal Entries with Titles**:
  * Give each day's reflection a meaningful theme/title (e.g., "Morning Sunlight", "Warm Coffee with Mom").
  * 1,000-character paragraph limit with live counter and mindful prompt.
  * Inline editing, updating, and safe deletion with confirmation modals.
* **Strict Privacy & Isolation**: Each user's journal is completely isolated at both the database and REST API levels. Users can never view, edit, or delete another user's reflections.
* **One Entry Per Day Rule**: Database-level unique constraint (`owner` + `date`) and serializer validations prevent duplicate entries per day while allowing seamless edits.
* **Interactive Monthly Calendar**:
  * Visual status indicators (leaf badges) for days with written reflections.
  * Today highlight and current day jump button.
  * Month/year navigation.
  * Click any past or present date to open the journal editor for that specific day.
* **Today's Gratitude Hero Card**:
  * Prominent daily prompt with status detection.
  * Quick-access reflection writer or instant preview quote with title of today's gratitude.
* **Recent Gratitude Timeline & Search**:
  * Chronological cards of recent reflections showing title, relative day badges ("Today", "Yesterday"), and content snippet.
  * Searchable modal to browse and filter all past memories by title or content.

* **Mindful Visual Design**:
  * Serene, warm linen (`#FAF7F2`) and sage green (`#3D624C`) color palette.
  * Refined typography pairing Google Fonts **Lora** (editorial serif) and **Plus Jakarta Sans** (clean modern UI).
  * Fully responsive across mobile, tablet, laptop, and desktop.

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.12, Django 5.2 | Web framework, ORM, Admin interface |
| **API** | Django REST Framework (DRF) | RESTful API, Serializers, Token Authentication |
| **CORS** | django-cors-headers | Cross-origin communication with React dev server |
| **Database** | SQLite 3 | Embedded SQL relational database |
| **Frontend** | Pure React (`react`, `react-dom`) | 100% pure React functional components & hooks |
| **Icons & UI** | Pure React SVG components | Zero third-party UI/icon libraries |
| **Styling** | Vanilla Modern CSS | Custom serene design system with CSS custom properties |


---

## 📁 Project Structure

```text
daily-gratitude-journal/
├── backend/
│   ├── config/                     # Project configuration
│   │   ├── settings.py             # DRF, CORS, Database & Auth settings
│   │   ├── urls.py                 # Main URL router
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── journal/                    # Journal Django Application
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_demo.py    # Seed demo user & sample entries
│   │   ├── migrations/             # Database migrations
│   │   ├── admin.py                # Django Admin configuration
│   │   ├── models.py               # Entry model & unique constraint
│   │   ├── serializers.py          # API serializers & validation
│   │   ├── urls.py                 # API routes (/api/...)
│   │   ├── views.py                # Class-based views & permissions
│   │   └── tests.py                # Automated test suite (12 tests)
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx          # Header with user greeting & logout
│   │   │   ├── TodayCard.jsx       # Hero prompt & today's quote preview
│   │   │   ├── CalendarView.jsx    # Interactive monthly calendar
│   │   │   ├── JournalEditor.jsx   # Modal editor with character counter
│   │   │   ├── RecentEntries.jsx   # Timeline of recent reflections
│   │   │   ├── AllEntriesModal.jsx # Searchable all-entries modal
│   │   │   ├── ConfirmModal.jsx    # Accessible confirmation dialog
│   │   │   └── Toast.jsx           # Notification toast banner
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # User authentication state & token
│   │   ├── pages/                  # Page views
│   │   │   ├── LoginPage.jsx       # Login form with demo autofill
│   │   │   ├── RegisterPage.jsx    # User registration form
│   │   │   └── DashboardPage.jsx   # Main application dashboard
│   │   ├── services/               # API service layer
│   │   │   ├── api.js              # Fetch client & auth header injection
│   │   │   ├── auth.js             # Auth endpoints service
│   │   │   └── entries.js          # CRUD entries endpoints service
│   │   ├── styles/
│   │   │   └── index.css           # Design tokens & responsive styles
│   │   ├── App.jsx                 # App root & auth routing
│   │   └── main.jsx
│   ├── .env                        # Frontend environment variables
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔒 How Authentication Works

1. **Registration** (`POST /api/register/`):
   * User provides username, email (optional), password, and confirm password.
   * On creation, Django generates a secure token (`rest_framework.authtoken.models.Token`).
   * Returns `{ "token": "...", "user": { "id": 1, "username": "..." } }`.
2. **Login** (`POST /api/login/`):
   * Authenticates username and password.
   * Returns the auth token and user profile.
3. **Session Persistence**:
   * The React frontend saves the token in browser `localStorage` under `gratitude_token`.
   * Subsequent HTTP requests include the token in the standard DRF header:
     ```http
     Authorization: Token <user_auth_token>
     ```
4. **Logout** (`POST /api/logout/`):
   * Inactivates/deletes the token from the backend database and clears local storage.
5. **Backend-Enforced Privacy**:
   * All journal views inherit `permissions.IsAuthenticated`.
   * All database queries explicitly filter: `Entry.objects.filter(owner=request.user)`.
   * Unauthenticated or cross-user requests receive `401 Unauthorized` or `404 Not Found`.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Register a new user and receive token | No |
| `POST` | `/api/login/` | Log in and receive token | No |
| `POST` | `/api/logout/` | Invalidate current auth token | Yes |
| `GET` | `/api/me/` | Get current authenticated user profile | Yes |

### Journal Entries

| Method | Endpoint | Query Params | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/entries/` | `?date=YYYY-MM-DD`<br>`?month=YYYY-MM`<br>`?search=keyword` | List current user's journal entries | Yes |
| `POST` | `/api/entries/` | — | Create a daily gratitude entry | Yes |
| `GET` | `/api/entries/<id>/` | — | Retrieve single entry details | Yes |
| `PUT` | `/api/entries/<id>/` | — | Update an existing entry | Yes |
| `PATCH` | `/api/entries/<id>/` | — | Partially update an existing entry | Yes |
| `DELETE` | `/api/entries/<id>/` | — | Delete a journal entry | Yes |

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
* Python 3.10+
* Node.js 18+ and npm

---

### 2. Backend Setup (Django)

Open a terminal in the `backend/` directory:

```bash
cd backend

# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows (PowerShell/CMD):
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. (Optional) Seed demo users & sample entries
python manage.py seed_demo

# 6. Start the Django development server
python manage.py runserver 127.0.0.1:8000
```

The Django REST API will be running at `http://127.0.0.1:8000/api/` and Django Admin at `http://127.0.0.1:8000/admin/`.

#### Pre-Configured Credentials

| Role | Username | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Django Admin (Superuser)** | `admin` | `admin123` | `http://127.0.0.1:8000/admin/` |
| **Demo User** | `alan` | `password123` | `http://localhost:5173/` |


---

### 3. Frontend Setup (React)

Open a second terminal in the `frontend/` directory:

```bash
cd frontend

# 1. Install npm packages
npm install

# 2. Start the React development server
npm start
```

Open your browser and navigate to **`http://localhost:3001`** *(or `http://localhost:3000`)*.


---

## 🧪 Running Automated Tests

Run the complete Django backend test suite covering registration, authentication, constraints, and privacy isolation:

```bash
cd backend
.\venv\Scripts\python manage.py test journal
```

Result:
```text
Ran 12 tests in ~0.5s
OK
```

---

## 🔮 Future Enhancements

* **Mood Tracking**: Add a simple, serene 5-point daily mood selector (e.g. Peaceful, Grateful, Calm, Energetic, Reflective).
* **Daily Reminders & Notifications**: Gentle browser or email notifications at user's preferred time.
* **Mindfulness Streak Counter**: Track continuous days of gratitude reflection.
* **Export to PDF / Markdown**: Download past journal memories as a keepsake digital booklet.
* **Inspirational Quotes**: Curated mindfulness reflections at the start of each session.

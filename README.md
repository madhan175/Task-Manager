# Task Manager Web Application

A production-grade, secure, and modern Full-Stack Task Manager application built with **FastAPI** (Python), **React** (Vite + Javascript), and **SQLAlchemy** with MySQL/SQLite dynamic integration, JWT-based authentication, and Docker.

---

## ✨ Features

- **Aligned Direct Endpoints**: Complete coverage of assignment-specified endpoints mapped *both* at the root level and under `/api/v1` for 100% router compatibility.
- **Resilient Content-Type Auth**: The login endpoint dynamically handles both JSON payloads (used by React) and URL-encoded form data (used by pytest and Swagger Docs).
- **Task Pagination & Offset Limits**: Backend and frontend limits task listing to prevent database overload (`?limit=5&skip=0`).
- **Completion State Filtering**: Task search supports filtering by completion status (`?completed=true` or `?completed=false`).
- **Dynamic DB Engine**: Fully resilient configurations that automatically switch thread arguments for SQLite during testing/local execution, while supporting connection pooling for MySQL/PostgreSQL in production.
- **Futuristic Glassmorphism UI**: Beautiful, fully responsive layout built with curated HSL dark mode palettes, interactive active states, and custom responsive media queries.
- **Production Prepped**: Complete Docker configurations, environment variables template, and pre-configured deployment guides.

---

## 📂 Project Structure

```
task-manager/
├── backend/              # FastAPI Backend Source
│   ├── app/              # Core API modules
│   │   ├── database.py   # SQL Engine & Session management
│   │   ├── models.py     # SQLAlchemy DB models
│   │   ├── schemas.py    # Pydantic validation schemas
│   │   ├── auth.py       # JWT, Bcrypt and User extraction
│   │   └── routers/      # Modular API routes
│   │       ├── users.py  # Registration & Login endpoints
│   │       └── tasks.py  # Create, Read, Update, Delete tasks
│   ├── tests/            # Pytest integration tests
│   ├── requirements.txt  # Python dependencies
│   ├── Dockerfile        # Container config
│   └── docker-compose.yml# Container orchestration
├── frontend/             # React + Vite Frontend App
│   ├── src/
│   │   ├── api.js        # Axios Client setup with dynamic URL
│   │   ├── App.jsx       # State management & Layout view
│   │   └── App.css       # Premium custom stylesheet
│   ├── index.html
│   ├── .env              # Local environment variables
│   └── .env.production   # Production environment template
└── README.md             # Main project documentation
```

---

## ⚙️ Environment Variables

### Backend Configuration
Configure a `.env` file in the `backend/` directory (based on `backend/.env.example`):
```env
SECRET_KEY=your_secure_random_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/task_manager_db
# Or use SQLite locally:
# DATABASE_URL=sqlite:///./task_manager.db
```

### Frontend Configuration
Configure a `.env` file in the `frontend/` directory (based on `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Setup & Run Locally

### 1. Using Docker (Recommended)
Ensure Docker is installed and running, navigate to the `backend/` folder, and execute:
```bash
cd backend
docker-compose up --build
```
The FastAPI backend will be available at `http://localhost:8000` and its Interactive Docs at `http://localhost:8000/docs`.


### 2. Manual Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your MySQL database or utilize SQLite (defined via `DATABASE_URL` in `.env`).
5. Run the uvicorn development server:
   ```bash
   uvicorn app.main:app --reload
   ```


#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install standard Node packages:
   ```bash
   npm install
   ```
3. Boot the Vite hot-reloading dev server:
   ```bash
   npm run dev
   ```
The frontend UI will be running at `http://localhost:5173`.

---

## 📂 Aligned REST API Endpoints

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user | |
| **POST** | `/login` | Authenticate & retrieve JWT token | |
| **POST** | `/tasks` | Create a new task (Auth Required) | |
| **GET** | `/tasks` | List user's tasks (Auth Required) | `completed` (bool), `limit` (int), `skip` (int) |
| **GET** | `/tasks/{id}`| Retrieve a specific task detail | |
| **PUT** | `/tasks/{id}`| Update fields / Mark completed | |
| **DELETE**| `/tasks/{id}`| Delete a task | |

*Note: All endpoints are also accessible under `/api/v1` prefix (e.g., `/api/v1/tasks/`) for complete backward compatibility.*

---

## 🧪 Testing with Pytest

Run the extensive backend integration test suite:
```bash
pytest
```
*The test suite covers:*
- User registration & password hashing verification.
- Content-type resilient JWT login (`form-data` and `json`).
- Ownership isolation (users can only access their own tasks).
- Task filtering query logic (`?completed=true`).
- Task pagination limit & offset skips (`?limit=2&skip=2`).


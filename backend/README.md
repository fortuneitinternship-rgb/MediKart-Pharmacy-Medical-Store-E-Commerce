# MediKart FastAPI Backend

## 1. Open the backend folder

```powershell
cd backend
```

## 2. Create/activate the virtual environment

```powershell
python -m venv environment
.\environment\Scripts\activate
```

## 3. Install packages

```powershell
pip install -r requirements.txt
```

## 4. Create MySQL database

Open MySQL and run:

```sql
CREATE DATABASE medikart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Create `.env`

Copy `.env.example` to `.env` and set your MySQL username/password.

## 6. Start FastAPI

```powershell
uvicorn app.main:app --reload
```

## 7. Open API documentation

http://127.0.0.1:8000/docs

## Authentication endpoints

POST `/api/auth/register`
POST `/api/auth/login`
GET `/api/auth/me`
POST `/api/auth/forgot-password`
POST `/api/auth/verify-otp`
POST `/api/auth/reset-password`
POST `/api/auth/logout`

The frontend `authApi.js` uses the same paths and sends `username`, `email`, `password`, and `confirm_password` for registration.

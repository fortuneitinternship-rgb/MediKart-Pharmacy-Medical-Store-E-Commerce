# MediKart Backend

## Run

From the repository root in PowerShell:

```powershell
cd backend
python -m venv environment
.\environment\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
uvicorn app.main:app --reload
```

The default database is `backend/medikart.db` (SQLite). Tables are created when FastAPI starts. Set `DATABASE_URL` in `backend/.env` to switch databases:

```dotenv
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/medikart
```

```dotenv
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/medikart
```

Set `SECRET_KEY` to a private random value before deployment. Configure `SMTP_EMAIL` and `SMTP_PASSWORD` in `backend/.env` for email OTP.

Gmail: enable 2-Step Verification, create an App Password at `myaccount.google.com/apppasswords`, then put it in `SMTP_PASSWORD`.

The forgot-password flow uses `POST /api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/resend-otp`, and `/api/auth/reset-password`. OTPs are HMAC-hashed in `email_otps`, expire after 5 minutes, allow 3 incorrect attempts, and can be resent after 60 seconds.

Open API docs at http://127.0.0.1:8000/docs.

## Frontend

In a second PowerShell terminal from the repository root:

```powershell
npm install
npm start
```

The React app uses `http://127.0.0.1:8000` by default. To change it, set `REACT_APP_API_URL` in the frontend `.env` and restart the development server.

## Product API

- `GET /api/products` and `GET /api/products/{id}` are public.
- `POST /api/products`, `PUT /api/products/{id}`, and `DELETE /api/products/{id}` require an administrator bearer token.
- Existing authenticated APIs cover registration/login, profile, addresses, cards, orders, payments, and newsletter subscriptions.
- After registering an account, promote it for product management with `UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';` in SQLite.

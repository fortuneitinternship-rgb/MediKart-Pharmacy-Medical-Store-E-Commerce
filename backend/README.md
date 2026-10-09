# MediKart Backend

## Run the API

From the repository root in PowerShell:

```powershell
cd .\medikart\backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env: set DATABASE_URL, SECRET_KEY, and SMTP settings.
.\environment\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run Uvicorn from `medikart\backend`: the same `DATABASE_URL` is loaded by the SQLAlchemy engine and Alembic, and relative SQLite URLs resolve from that directory. The checked-in example uses MySQL; the application default, if no `.env` exists, is `sqlite:///./medikart.db`. Startup creates missing tables with `Base.metadata.create_all()` and adds the supported compatibility columns for existing databases.

Examples (replace credentials and choose exactly one database):

```dotenv
DATABASE_URL=mysql+pymysql://medikart_user:your_password@localhost:3306/medikart
```

```dotenv
DATABASE_URL=sqlite:///./medikart.db
```

The actual `.env` is private and is not printed or committed. Check that it points to the database you inspect; all backend API requests use this one setting.

Open interactive API docs at http://127.0.0.1:8000/docs. CORS reads comma-separated `FRONTEND_ORIGINS` and allows all methods/headers, including browser `OPTIONS` preflights. The defaults include React development ports 3000 and 5173.

## Frontend

From a second PowerShell terminal:

```powershell
cd .\medikart
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm start
```

`REACT_APP_API_URL` defaults to `http://127.0.0.1:8000`. Change it in `medikart\.env` if the API runs elsewhere, then restart Create React App. Protected requests use the stored access token as `Authorization: Bearer <token>`.

## API connection map

Frontend paths below are relative to `medikart\src`.

| Method and endpoint | Frontend caller |
|---|---|
| `POST /api/auth/register` | `components/Register/Register.js` via `api/authApi.js` |
| `POST /api/auth/login`, `GET /api/auth/me` | `components/Login/Login.js` via `api/authApi.js` |
| `POST /api/auth/forgot-password`, `/api/auth/resend-otp`, `/api/auth/verify-otp`, `/api/auth/reset-password` | `components/ForgotPassword/ForgotPassword.js` via `api/authApi.js` |
| `POST /api/auth/send-otp` | No current frontend caller |
| `GET/PUT /api/users/me` | `pages/Profile/Profile.js` via `api/authApi.js` |
| `GET/POST /api/addresses`, `PUT/DELETE /api/addresses/{id}` | `pages/Addresses/Addresses.js` via `api/addressApi.js` |
| `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{order_id}`, `PATCH /api/orders/{order_id}/cancel`, `GET /api/orders/{order_id}/track` | Checkout saves the address and order before clearing the local cart; order list/history/tracking read from the API via `api/ordersApi.js` |
| `GET /api/products`, `GET /api/products/{id}` | `pages/ProductListingPage.js`, `pages/ProductDetails/ProductDetails.js` |
| `POST/PUT/DELETE /api/products[/{id}]` (admin bearer token required) | `pages/AdminProducts/AdminProducts.js` via `services/api.js` |
| `GET /api/products/featured`, `/trending`, `/flash-sale`, `/new-arrivals` | Available in `api/productApi.js`; the home sections still use static presentation data |
| `POST /api/newsletter/subscribe` | `components/Newsletter/Newsletter.js` via `services/api.js`; displays backend success/error responses |
| `POST /api/cards`, `GET /api/cards`, `DELETE /api/cards/{card_id}` | `pages/Payments/Payments.js` via `api/cardApi.js`; only card last four digits and metadata are displayed/stored |
| `POST /api/payments/process`, `GET /api/payments/order/{order_id}` | No current frontend caller; checkout records the selected payment method on its order request |
| `GET /api/admin/dashboard` | No current frontend caller |
| `POST /api/contact/messages` | `pages/Contact/Contact.js` |
| `GET/POST /api/reviews` | `pages/Reviews/Reviews.js` |
| `POST /api/feedback` | `components/Feedback/Feedback.js` |
| `GET/POST/DELETE /api/health-records` | `pages/HealthRecords/HealthRecords.js` |
| `GET/POST /api/prescriptions` | `pages/UploadPrescription/UploadPrescription.js`; file bytes and metadata are stored in the configured database |

The shared `services/api.js` client uses `REACT_APP_API_URL` (default `http://127.0.0.1:8000`) and attaches the signed-in user's bearer token. The cart and wishlist remain browser-local because there are no cart/wishlist endpoints. Checkout records a pending payment with the order; `/api/payments/process` is not connected to a payment provider and is not proof of a real charge. Saved card metadata includes only the last four digits and expiry; do not deploy card entry without HTTPS, a compliant card-data environment, and provider-hosted/tokenized fields. All backend-created tables use the configured `DATABASE_URL`; copy `.env.example` and set `DATABASE_URL` to your MySQL connection before starting the API if MySQL is the target.

After registering, make an administrator in the configured database before using Product Inventory:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'your@email.com';
```

## OTP email configuration and diagnostics

Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_EMAIL` to the Gmail sender, and `SMTP_PASSWORD` to a Gmail **App Password** (not the normal account password). App Passwords require 2-Step Verification. Port 587 uses SMTP plus STARTTLS; port 465 selects SMTP_SSL. OTP values are stored as an HMAC hash, expire after `OTP_EXPIRE_MINUTES` (default 5), allow `OTP_MAX_ATTEMPTS` failures (default 3), and can be re-requested after `OTP_RESEND_COOLDOWN_SECONDS` (default 60). Email delivery is synchronous so SMTP errors return HTTP 503 rather than a success response.

Test SMTP independently from the backend directory:

```powershell
.\environment\Scripts\Activate.ps1
python test_email.py recipient@example.com
```

Omit the recipient argument to be prompted. The test message contains a clearly marked test OTP. Check whether a firewall/antivirus/network blocks the Gmail ports in PowerShell:

```powershell
Test-NetConnection smtp.gmail.com -Port 587
Test-NetConnection smtp.gmail.com -Port 465
```

`TcpTestSucceeded: False` means the TCP connection is blocked or unreachable. Allow outbound TCP for the selected port in Windows Defender Firewall/antivirus or ask the network administrator; do not disable protection globally.

## Verify records directly

For the configured MySQL database, connect to `medikart` in MySQL Workbench (or another MySQL client) using the same host/database from `DATABASE_URL`, then run:

```sql
SELECT id, name, email, phone, last_login FROM users;
SELECT id, user_id, full_name, address_line1, city, state, pincode FROM addresses;
SELECT id, order_id, user_id, subtotal, total_amount, status FROM orders;
SELECT email, expires_at, attempts, is_used FROM email_otps;
```

For SQLite, open the exact file from the `sqlite:///...` URL in DB Browser for SQLite and run the same SQL. Never query or display `hashed_password` or `otp_hash` as if they were plaintext.

## Python version recommendation

Python 3.14.2 runs the current backend tests, but Python 3.12 is the safer project runtime while Python database/security dependencies complete 3.14 support. Keep the current environment until the new one is verified. Install Python 3.12 first, then recreate the venv from the repository root:

```powershell
cd .\medikart\backend
deactivate
if (Test-Path .\environment) { Rename-Item .\environment .\environment-py314-backup }
py -3.12 -m venv environment
.\environment\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pytest -q tests\test_users.py
```

`py -3.12` requires the Python 3.12 Windows runtime to be installed and registered with the Python Launcher. The bcrypt/passlib compatibility warning is addressed by pinning `bcrypt==4.0.1`.

## Tests

```powershell
cd .\medikart\backend
.\environment\Scripts\python.exe -m pytest -q tests\test_users.py
```

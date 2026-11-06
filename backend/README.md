# MediKart Backend

## Run the API

From the repository root in PowerShell:

```powershell
cd .\medikart
npm install
npm run export:catalog
cd .\backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Use SQLite without a local MySQL server by setting DATABASE_URL in .env:
# DATABASE_URL=sqlite:///./medikart.db
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m app.scripts.seed_product_catalog
uvicorn app.main:app --reload
```

`backend\.env` is loaded from the backend folder regardless of the current working directory. If `DATABASE_URL` is omitted, the API uses SQLite at `backend\medikart.db`; the database file is created automatically and keeps records across restarts. Relative SQLite URLs such as `sqlite:///./medikart.db` resolve from the backend folder, not the terminal's current directory. Existing `.env` settings override this default. To use MySQL instead, keep the MySQL URL from `.env.example`, create the `medikart` database, and grant the configured user permission to create and alter tables. Startup upgrades the legacy address columns (`name`/`address_line`) without dropping saved address data, adds the optional second address line, and creates missing tables. `Base.metadata.create_all()` does not migrate arbitrary changes to existing tables.

The local MySQL connection in `.env.example` is:

```dotenv
DATABASE_URL=mysql+pymysql://medikart_user:your_password@localhost:3306/medikart
```

Copy `.env.example` to `.env` before starting the API. The example is configured for MySQL; replace its `DATABASE_URL` with `sqlite:///./medikart.db` to use SQLite instead. `.env` is ignored by Git; do not commit real database credentials. All backend API reads and writes share this `DATABASE_URL`, including users, products, cart, wishlist, addresses, orders, payments, and submissions.

Open interactive API docs at http://127.0.0.1:8000/docs. CORS reads comma-separated `FRONTEND_ORIGINS` and allows all methods/headers, including browser `OPTIONS` preflights. The defaults include Create React App ports 3000 and 3001, plus Vite port 5173, on both `localhost` and `127.0.0.1`.

## Frontend

From a second PowerShell terminal:

```powershell
cd .\medikart
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm start
```

`REACT_APP_API_URL` defaults to `http://127.0.0.1:8000`. Change it in `medikart\.env` if the API runs elsewhere, then restart Create React App. Protected requests use the stored access token as `Authorization: Bearer <token>`.

The storefront, product listings, and product details are available before login. Sign in is required for account pages and checkout; guests can browse products and are prompted to sign in to access a saved cart or place an order. Checkout loads the cart from the API, saves the delivery address, creates the order through the API, and displays the returned order ID. The address step supports manual entry or browser geolocation with an OpenStreetMap preview; location access is requested only when the shopper chooses “Choose on Map.”

## API connection map

Frontend paths below are relative to `medikart\src`.

| Method and endpoint | Frontend caller |
|---|---|
| `POST /api/auth/register` | `components/Register/Register.js` via `api/loginApi.js` |
| `POST /api/auth/login`, `GET /api/auth/me` | `components/Login/Login.js` via `api/loginApi.js` |
| `POST /api/auth/forgot-password`, `/api/auth/resend-otp`, `/api/auth/verify-otp`, `/api/auth/reset-password` | `components/ForgotPassword/ForgotPassword.js` via `api/loginApi.js` |
| `POST /api/auth/send-otp` | No current frontend caller |
| `GET/PUT /api/users/me` | `pages/Profile/Profile.js` via `api/loginApi.js` |
| `GET/POST /api/addresses`, `PUT/DELETE /api/addresses/{id}` | `pages/Addresses/Addresses.js` via `api/addressApi.js` |
| `GET /api/checkout/cart`, `POST /api/checkout/address`, `POST /api/checkout/orders` | `pages/Checkout/Checkout.js` via `api/checkoutApi.js`; cart checkout clears ordered cart rows, while Buy Now checks out the selected product without changing the saved cart |
| `GET/POST /api/orders/`, `GET /api/orders/{order_id}`, `PATCH /api/orders/{order_id}/cancel`, `GET /api/orders/{order_id}/track` | `api/ordersApi.js`; the Account page and tracking page load the signed-in user's orders |
| `GET/POST /api/cart`, `POST /api/cart/import`, `PUT/DELETE /api/cart/{id}` | `api/cartApi.js`; anonymous cart contents migrate idempotently after login |
| `GET/POST /api/wishlist`, `POST /api/wishlist/import`, `DELETE /api/wishlist/{product_id}` | `api/wishlistApi.js`; anonymous wishlist contents migrate idempotently after login |
| `GET/POST/DELETE /api/compare[/{product_id}]` | `api/compare.py`; signed-in users can compare up to four products |
| `GET /api/products` (optional `q`, `category`, `min_price`, `max_price`, `sort_by`, `sort_order`, `limit`, `offset`), `GET /api/products/{id}` | `pages/ProductListingPage.js`, `pages/ProductDetails/ProductDetails.js` |
| `GET /api/products/categories`, admin `POST/PUT/DELETE /api/products/categories[/{id}]` | Product category listing and administration |
| `POST/PUT/DELETE /api/products[/{id}]` (admin bearer token required) | `pages/AdminProducts/AdminProducts.js` via `services/api.js` |
| `GET /api/products/featured`, `/trending`, `/flash-sale`, `/new-arrivals` | Available in `api/productApi.js`; the home sections still use static presentation data |
| `POST /api/newsletter/subscribe` | `components/Newsletter/Newsletter.js` via `services/api.js`; displays backend success/error responses |
| Card endpoints | `pages/Payments/Payments.js` expects card endpoints, but no `/api/cards` router is currently registered |
| `GET/POST /api/coupons`, `POST /api/coupons/validate`, admin `GET/PUT/DELETE /api/coupons/{id}` | Coupon validation is also enforced during checkout; coupon use is counted with order creation |
| `POST /api/uploads/products/{product_id}` | Admin-only JPEG/PNG/WebP upload; files are served under `/uploads` |
| `GET/POST /api/returns`, admin `GET/PATCH /api/returns/admin[/{id}]` | Signed-in shoppers can request returns for delivered orders; administrators manage the request/refund status |
| `GET /api/admin/orders`, `PATCH /api/admin/orders/{order_id}/status` | Admin order listing, filtering, and guarded status transitions |
| `GET /api/admin/reports/sales`, `GET /api/admin/dashboard` | Admin sales summaries and dashboard metrics |
| `POST /api/contact/messages`, admin `GET /api/admin/contact/messages` | `pages/Contact/Contact.js` |
| `GET/POST /api/reviews` | `pages/Reviews/Reviews.js` |
| `POST /api/feedback` | `components/Feedback/Feedback.js` |
| `GET/POST/DELETE /api/health-records` | `pages/HealthRecords/HealthRecords.js` |
| `GET/POST /api/prescriptions` | `pages/UploadPrescription/UploadPrescription.js`; file bytes and metadata are stored in the configured database |

The shared `services/api.js` client uses `REACT_APP_API_URL` (default `http://127.0.0.1:8000`) and attaches the signed-in user's bearer token. Cart and wishlist imports use persistent migration IDs so retries do not duplicate items. Product image uploads are stored under `UPLOAD_DIR` (default `backend\uploads`) and served from `/uploads`. Checkout validates coupons on the server and records their usage with the order.

`/api/payments/process` is still a local simulator and never represents a real charge. A payment provider (for example, Razorpay or Stripe) and its test credentials must be selected/configured before real gateway checkout or provider-specific webhook verification can be implemented. Never store full card numbers or CVV values in this application.

## Refresh the Shop catalog

The source catalog contains 217 products in 10 categories. Repeat these commands after changing the frontend catalog, using the same database configured by `DATABASE_URL`:

```powershell
cd .\medikart
npm run export:catalog
cd .\backend
.\environment\Scripts\python.exe -m app.scripts.seed_product_catalog
```

The export is written to `backend\data\product_catalog.json`. The sync creates missing categories and products, fills only missing catalog details on existing products, and replaces missing, promotional-banner, or generic `productN.*` image placeholders with the matching catalog image path. Existing product pricing and other non-empty product details are preserved. The sync also adds the catalog detail columns to an existing `products` table and removes a legacy name-only unique index so the same product name can exist in distinct categories. Run it again after changing the frontend catalog; it is safe to repeat. The Shop then loads all active products and categories from `GET /api/products`; “Load More Products” reveals the next batch and “Show All Products” reveals the full filtered catalog.

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

The root and `/health` endpoints only report API status; they do not create
records. Create records through the corresponding `POST` endpoints in `/docs`
or through the frontend, then inspect the database configured by
`DATABASE_URL`. Successful user, address, cart, order, and submission writes
are committed before the API responds.

For the configured MySQL database, connect to `medikart` in MySQL Workbench (or another MySQL client) using the same host/database from `DATABASE_URL`, then run:

```sql
SELECT id, name, email, phone, last_login FROM users;
SELECT id, name, price, stock, category_id FROM products;
SELECT id, user_id, full_name, address_line1, city, state, pincode FROM addresses;
SELECT id, user_id, product_id, quantity FROM cart_items;
SELECT id, order_id, user_id, product_amount, total_amount, status FROM orders;
SELECT id, order_id, product_id, quantity FROM order_items;
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

## Docker Compose (local development)

From `medikart\backend`, copy `.env.example` to `.env`, replace `SECRET_KEY`,
`MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD`, then start the API and MySQL:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

The API is available at http://127.0.0.1:8000 and the OpenAPI UI at
http://127.0.0.1:8000/docs. MySQL data persists in the
`medikart_mysql_data` Docker volume. This Compose file is for local deployment;
production still requires hardened secrets, HTTPS, backups, monitoring, and a
chosen hosting provider. Payment processing remains a local simulator and
does not charge cards or bank accounts.

## Tests

```powershell
cd .\medikart\backend
.\venv\Scripts\python.exe -m pytest -q tests\test_users.py
```

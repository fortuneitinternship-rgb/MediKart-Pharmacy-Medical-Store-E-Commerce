# MediKart

MediKart is a React storefront backed by a FastAPI service and a SQL database. The storefront and product catalog are public. Sign in is required for cart operations, saved addresses, and checkout.

## Features and current boundaries

- Browse products and categories before signing in. The Shop loads active products from `GET /api/products`; use its filters, search, and **Show All Products** control to view the full catalog and available product images.
- **Add to Cart** saves the product and quantity to the signed-in user's backend cart. Open the cart from the navigation bar to review products, change quantities, remove items, and proceed to checkout.
- **Buy Now** on a product detail page opens checkout for that product and the selected quantity. It does not add to or increment the saved cart. The checkout service calculates prices from the database, creates the order, and returns the Order ID.
- Checkout saves the delivery address through the API. Shoppers can enter an address manually or grant browser location access to preview coordinates on OpenStreetMap; geolocation does not replace the required street address.
- Authentication, products, cart, wishlist, addresses, checkout, orders, and other listed backend resources use the configured API/database.

**Payments are not connected to a payment provider.** The current order API records a selected payment method; it does not charge a card or verify a provider webhook. Coupons, returns/refunds, product-image uploads, blog/careers APIs, and Docker/production deployment are not implemented as complete backend features. Do not treat the supplied BE-001–BE-054 task list as completed merely because a related model or placeholder endpoint exists.

## Requirements

- Node.js and npm
- Python 3.12 recommended for the backend
- A running MySQL database (or another SQL database supported by the configured SQLAlchemy driver)

## Start the backend (Windows PowerShell)

From the repository root, prepare the backend environment:

```powershell
cd .\medikart\backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
py -3.12 -m venv environment
.\environment\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Edit `backend\.env` before starting the API:

```dotenv
DATABASE_URL=mysql+pymysql://medikart_user:YOUR_PASSWORD@localhost:3306/medikart
SECRET_KEY=replace_with_a_long_random_secret_at_least_32_chars
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Create the `medikart` database and grant the configured user permission to create and modify tables. `DATABASE_URL` is required; the backend does not silently fall back to SQLite. The API loads `backend\.env` regardless of the current directory and creates missing SQLAlchemy tables at startup. Never commit `.env` or use the example secret in production.

After editing `backend\.env`, export the catalog from `medikart`, then seed and start the API from `medikart\backend`:

```powershell
cd ..\..
cd .\medikart
npm install
npm run export:catalog
cd .\backend
python -m app.scripts.seed_product_catalog
uvicorn app.main:app --reload
```

The API is available at <http://127.0.0.1:8000>. Interactive OpenAPI documentation is at <http://127.0.0.1:8000/docs>, and the health endpoint is <http://127.0.0.1:8000/health>.

> If you already opened the backend terminal at `medikart\backend`, skip the `cd ..\..`, `cd .\medikart`, and second `cd .\backend` lines; run the export from the `medikart` directory and the seed/API commands from `medikart\backend`.

## Start the frontend (second terminal)

From `medikart`:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm start
```

Open <http://localhost:3000>. `REACT_APP_API_URL` defaults to `http://127.0.0.1:8000`; set it in `medikart\.env` if the API runs elsewhere, then restart the frontend. The backend `FRONTEND_ORIGINS` must include the exact frontend origin (scheme, host, and port).

## Shopping and checkout flow

1. Browse the storefront and open a product. Sign in or register when prompted for an authenticated action.
2. Select **Add to Cart** to save the selected quantity to `POST /api/cart`. Review the saved products at `/cart`.
3. Select **Buy Now** on a product detail page to start checkout for that product and quantity without changing the saved cart.
4. Cart checkout loads `GET /api/checkout/cart`. Both checkout paths save the delivery address with `POST /api/checkout/address`.
5. Submit the order to `POST /api/checkout/orders`. The API validates product IDs and quantities, calculates totals from database prices, and returns the generated order ID for the success screen.

The default API base URL is local development only. Production deployment requires HTTPS, a production database and secret, correctly configured origins, and a real payment provider before enabling online card payments.

## API connection overview

| Feature | Backend API | Frontend integration |
| --- | --- | --- |
| Register, login, current user | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | `src/api/loginApi.js` |
| User profile | `/api/users/me` | `src/api/loginApi.js` |
| Product catalog, product details, comparison, and Buy Now | `/api/products`, `/api/products/{id}` | `src/api/productApi.js`; product details and comparison checkout use real catalog IDs |
| Cart | `/api/cart` | `src/api/cartApi.js`; authenticated user's cart is stored in the database |
| Wishlist | `/api/wishlist` | `src/api/wishlistApi.js` |
| Saved addresses | `/api/addresses` | `src/api/addressApi.js` |
| Checkout cart, address, order | `/api/checkout/cart`, `/api/checkout/address`, `/api/checkout/orders` | `src/api/checkoutApi.js`, `src/pages/Checkout/Checkout.js` |
| Orders and tracking | `/api/orders/`, `/api/orders/{order_id}`, `/api/orders/{order_id}/cancel`, `/api/orders/{order_id}/track` | `src/api/ordersApi.js`; order details and tracking load the signed-in user's backend order |
| Payments | `/api/payments/process`, `/api/payments/order/{order_id}` | No payment-provider integration; these endpoints do not prove a real charge |
| Contact, newsletter, reviews, feedback, health records, prescriptions | `/api/contact/messages`, `/api/newsletter/subscribe`, `/api/reviews`, `/api/feedback`, `/api/health-records`, `/api/prescriptions` | Corresponding frontend pages/components |
| Admin dashboard | `/api/admin/dashboard` | API endpoint exists; production role/security configuration must be reviewed before deployment |

Use `/docs` as the source of truth for request schemas and response shapes. An endpoint existing in FastAPI does not necessarily mean every UI screen is wired to it.

## Refresh the product catalog

From `medikart` after changing the frontend catalog:

```powershell
npm run export:catalog
cd .\backend
.\environment\Scripts\python.exe -m app.scripts.seed_product_catalog
```

The export writes `backend\data\product_catalog.json`. The seed script is safe to rerun and preserves existing non-empty product pricing and details.

## Email OTP (optional)

Email-based OTP flows require valid SMTP settings in `backend\.env`. For Gmail, use an App Password with two-step verification enabled; do not use the normal account password. Without SMTP configuration, OTP email delivery is unavailable.

## Tests and build

Run frontend tests from `medikart`:

```powershell
npm test -- --watchAll=false
```

Build the frontend:

```powershell
npm run build
```

Run backend tests from `medikart\backend`:

```powershell
.\environment\Scripts\python.exe -m pytest -q
```

The repository currently has a limited backend test suite; passing it does not certify every item in BE-001–BE-054.

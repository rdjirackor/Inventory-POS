# Inventory POS

Inventory POS is a full-stack point-of-sale and inventory management application.
It combines a Django REST API backend with a React + TypeScript frontend for managing products, stock, suppliers, staff, and dashboard analytics.

## Features

- JWT-based authentication (login, refresh, current user profile)
- Role/permission-guarded API endpoints
- Product management (SKU, barcode, pricing, tax, stock levels, warehouse, images)
- Category, warehouse, tax type, and discount management
- Supplier and purchase-order management
- Customer and cashier management
- Payments, notifications, and announcements
- Dashboard analytics (today’s sales, profit, low stock, top selling product, recent stock activity, 7-day order chart)

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT (`djangorestframework-simplejwt`)
- CORS Headers (`django-cors-headers`)
- SQLite (default local database)

### Frontend

- React
- TypeScript
- Vite
- React Router
- Recharts

## Repository Structure

```text
Inventory-POS/
├── backend/
│   ├── config/            # Django project config
│   ├── accounts/          # Core domain models, serializers, API views, permissions
│   ├── media/             # Uploaded media
│   └── manage.py
└── frontend/
    └── inventory/         # React + TypeScript frontend
```

## Local Development Setup

## 1) Clone and enter the project

```bash
git clone https://github.com/rdjirackor/Inventory-POS.git
cd Inventory-POS
```

## 2) Backend setup (Django API)

```bash
cd /home/runner/work/Inventory-POS/Inventory-POS/backend
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend base URL: `http://127.0.0.1:8000`  
API base URL: `http://127.0.0.1:8000/api/`

## 3) Frontend setup (React app)

```bash
cd /home/runner/work/Inventory-POS/Inventory-POS/frontend/inventory
npm install
npm run dev
```

Frontend URL (default Vite): `http://127.0.0.1:5173`

> The frontend API client is configured for `http://127.0.0.1:8000/api`.

## Authentication and Permissions

- Login endpoint (`POST /api/login/`) returns `access` and `refresh` tokens.
- The frontend stores tokens in `localStorage` and auto-refreshes expired access tokens via `POST /api/token/refresh/`.
- Most endpoints require authentication.
- API views are wrapped with model-level permission checks (`view/add/change/delete`) through `require_model_permissions`.
- A superuser account is the easiest way to access all resources in local development.

## API Overview

Base prefix: `/api/`

### Auth/User

- `POST /login/`
- `POST /token/refresh/`
- `GET /me/`
- `GET /users/`
- `GET /dashboard/`

### Inventory and Catalog

- `GET, POST /categories/`
- `GET, PUT, DELETE /categories/<id>/`
- `GET, POST /discounts/`
- `GET, PUT, DELETE /discounts/<id>/`
- `GET, POST /taxtypes/`
- `GET, PUT, DELETE /taxtypes/<id>/`
- `GET, POST /warehouses/`
- `GET, PUT, DELETE /warehouses/<id>/`
- `GET, POST /products/`
- `GET, PUT, DELETE /products/<id>/`

### Suppliers and Purchasing

- `GET, POST /suppliers/`
- `GET, PUT, DELETE /suppliers/<id>/`
- `GET, POST /purchase-orders/`
- `GET, PUT, DELETE /purchase-orders/<id>/`
- `GET, POST /purchase-order-items/`
- `GET, PUT, DELETE /purchase-order-items/<id>/`

### People and Operations

- `GET, POST /customers/`
- `GET, PUT, DELETE /customers/<id>/`
- `GET, POST /branches/`
- `GET, PUT, DELETE /branches/<id>/`
- `GET, POST /cashiers/`
- `GET, PUT, DELETE /cashiers/<id>/`
- `GET, PUT /settings/`
- `GET, POST /notifications/`
- `GET, POST /announcements/`
- `GET, PUT, DELETE /announcements/<id>/`
- `GET, POST /payments/`

## Frontend Routes

- `/login`
- `/dashboard`
- `/products`, `/products/create`, `/products/:id/edit`
- `/categories`, `/categories/create`, `/categories/:id/edit`
- `/suppliers`, `/suppliers/create`, `/suppliers/:id/edit`
- `/cashiers`, `/cashiers/create`, `/cashiers/:id/edit`
- `/taxtypes`, `/taxtypes/create`, `/taxtypes/:id/edit`
- `/warehouses`, `/warehouses/create`, `/warehouses/:id/edit`

## Available Scripts

From `frontend/inventory`:

- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build production assets
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

From `backend`:

- `python manage.py runserver` — run Django dev server
- `python manage.py migrate` — apply database migrations
- `python manage.py test` — run Django tests

## Troubleshooting

- **401 Unauthorized**: Ensure you are logged in and token refresh is working.
- **CORS errors**: Confirm frontend is running on `http://localhost:5173` or `http://127.0.0.1:5173` (allowed in Django settings).
- **Permission denied (403)**: Your user may lack model permissions; use a superuser for local setup or assign permissions/groups.
- **Media files not loading**: Verify backend is running and serving `/media/` in development.

## Notes

- Current backend settings are development-oriented (`DEBUG=True`, SQLite default DB).
- Before production use, move secrets and environment-specific config to environment variables and harden security settings.

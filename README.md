# Bareeq Al-Yusr (بريق اليسر)
## Buy Now Pay Later Platform - Backend API

A BNPL (Buy Now Pay Later) platform designed for essential goods in the Saudi market.

### 🌟 Features

- **No Interest** - Customers pay exactly what they borrowed
- **Flexible Repayment** - 1, 3, 6, 12, 18, or 24 month plans
- **Merchant Platform** - Easy purchase request system
- **Nafath Integration** - Saudi government login simulation
- **Low Commission** - Only 0.5% from merchants

---

## 🏗️ Architecture

**Hybrid FastAPI + Flask** architecture:
- **FastAPI** - Main REST API endpoints
- **Flask** - SQLAlchemy ORM and admin routes
- **Flask-SQLAlchemy** - Database management
- **JWT** - Token-based authentication

---

## 📁 Project Structure

```
breek_alysr/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── flask_app.py         # Flask application
│   ├── config.py            # Configuration
│   ├── database.py          # Flask-SQLAlchemy setup
│   ├── models/              # Database models
│   │   ├── user.py
│   │   ├── customer.py
│   │   ├── merchant.py
│   │   ├── purchase_request.py
│   │   ├── transaction.py
│   │   ├── payment.py
│   │   ├── settlement.py
│   │   └── repayment_plan.py
│   ├── routers/             # API endpoints
│   │   ├── auth.py
│   │   ├── customers.py
│   │   └── merchants.py
│   ├── schemas/             # Pydantic models
│   │   ├── auth.py
│   │   ├── customer.py
│   │   ├── merchant.py
│   │   └── common.py
│   ├── services/            # Business logic
│   │   ├── auth_service.py
│   │   ├── customer_service.py
│   │   ├── merchant_service.py
│   │   └── payment_service.py
│   └── utils/               # Utilities
│       ├── auth.py
│       └── response.py
├── .env
├── .env.example
├── requirements.txt
├── run.py                   # Application entry point
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (optional for development)
```

### 3. Run the Server

```bash
python run.py
```

### 4. Create Test Data

Visit: `http://localhost:8000/flask/admin/create-test-data`

This creates:
- **Customer**: customer@test.com / password123
- **Merchant**: merchant@test.com / password123

### 5. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (returns JWT token) |
| POST | `/auth/register` | Register new user |
| GET | `/auth/me` | Get current user info |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/me` | Get customer profile |
| POST | `/customers/accept-purchase` | Accept purchase request |
| PATCH | `/customers/update-limit` | Request limit increase |
| POST | `/customers/select-repayment-plan` | Select payment plan |
| POST | `/customers/make-payment` | Make a payment |
| GET | `/customers/transactions` | Get transactions |
| GET | `/customers/pending-requests` | Get pending requests |

### Merchants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/merchants/me` | Get merchant profile |
| POST | `/merchants/send-purchase-request` | Send purchase request |
| POST | `/merchants/receive-settlement` | Request settlement |
| GET | `/merchants/transactions` | Get transactions |
| GET | `/merchants/settlements` | Get settlements |
| POST | `/merchants/branches` | Create branch |

---

## 📋 API Examples

### 1. Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user_id": 1,
    "role": "customer"
  },
  "message": "Login successful",
  "timestamp": "2026-01-12T12:00:00"
}
```

### 2. Send Purchase Request (Merchant)

```bash
curl -X POST "http://localhost:8000/merchants/send-purchase-request" \
  -H "Authorization: Bearer <merchant_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "product_name": "Samsung Galaxy S24",
    "price": 3999.0,
    "quantity": 1
  }'
```

### 3. Accept Purchase (Customer)

```bash
curl -X POST "http://localhost:8000/customers/accept-purchase" \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": 1
  }'
```

### 4. Select Repayment Plan

```bash
curl -X POST "http://localhost:8000/customers/select-repayment-plan" \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 1,
    "plan_type": 3
  }'
```

### 5. Make Payment

```bash
curl -X POST "http://localhost:8000/customers/make-payment" \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 1,
    "amount": 1000.0
  }'
```

### 6. Receive Settlement (Merchant)

```bash
curl -X POST "http://localhost:8000/merchants/receive-settlement" \
  -H "Authorization: Bearer <merchant_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 1
  }'
```

---

## 💰 Business Rules

### Credit Limits
- Default: **2,000 SAR**
- Maximum: **50,000 SAR**
- Auto-approve up to: **5,000 SAR**

### Commission
- Rate: **0.5%**
- Deducted from merchant share
- Customer pays exact amount (no interest)

### Repayment Plans
| Plan | Installments | Interval |
|------|--------------|----------|
| 1 month | 1 | - |
| 3 months | 3 | Monthly |
| 6 months | 6 | Monthly |
| 12 months | 12 | Monthly |
| 18 months | 18 | Monthly |
| 24 months | 24 | Monthly |

### Purchase Requests
- Expiry: **24 hours**
- Customer must accept or reject

---

## 🔐 Security

- **JWT Authentication** - 24-hour token expiry
- **Role-based Access** - Customer/Merchant separation
- **Password Hashing** - bcrypt
- **Input Validation** - Pydantic schemas

---

## 🗄️ Database

### Models

1. **User** - Base authentication
2. **Customer** - Credit limits, balances
3. **Merchant** - Shop info, bank details
4. **Branch** - Merchant locations
5. **PurchaseRequest** - Pending purchases
6. **Transaction** - Accepted purchases
7. **Payment** - Customer payments
8. **Settlement** - Merchant payouts
9. **RepaymentPlan** - Payment schedules
10. **RepaymentSchedule** - Individual installments

### Migrations

```bash
# Initialize migrations (first time)
flask db init

# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade
```

---

## 🧪 Testing

### Run Tests

```bash
pytest tests/
```

### Test with Swagger UI

1. Open http://localhost:8000/docs
2. Click "Authorize"
3. Enter token from login
4. Test endpoints directly

---

## 🚀 Production Deployment

### Environment Variables

```bash
FLASK_ENV=production
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
```

### Run with Gunicorn

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker run:hybrid_app
```

---

## 📞 Support

For support and inquiries, contact the Bareeq Al-Yusr team.

---

## 📄 License

Copyright © 2026 Bareeq Al-Yusr. All rights reserved.

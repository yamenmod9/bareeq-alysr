# Bareeq Al-Yusr Frontend

> Modern React + TypeScript frontend for the Buy Now Pay Later (BNPL) platform

## 🚀 Features

- ✅ **Bilingual Support**: Full Arabic/English translations with RTL layout
- 🎨 **Saudi Market Design**: Emerald green & gold color palette  
- 🌓 **Dark/Light Themes**: System-aware theme switching
- 📱 **Mobile-First**: Fully responsive design optimized for mobile
- ⚡ **Performance**: Code splitting, lazy loading, optimized bundles
- 🎭 **Animations**: Smooth Framer Motion animations throughout
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 🔒 **Type-Safe**: Full TypeScript coverage
- 🧪 **Tested**: Unit tests (Vitest) + E2E tests (Playwright)

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Backend API running on `http://localhost:8000`

## 🛠️ Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_DEFAULT_LANGUAGE=ar
   VITE_DEFAULT_THEME=dark
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:5173`

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:ui      # Unit tests with UI
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # E2E tests with UI
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Shadcn/ui base components
│   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   └── forms/       # Form components
│   ├── pages/           # Page components
│   │   ├── auth/        # Login, Register
│   │   ├── customer/    # Customer pages
│   │   └── merchant/    # Merchant pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service modules
│   │   ├── api.client.ts
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   └── merchant.service.ts
│   ├── stores/          # Zustand state management
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   └── localeStore.ts
│   ├── types/           # TypeScript definitions
│   │   ├── models.ts
│   │   └── api.ts
│   ├── utils/           # Utility functions
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── format.ts
│   ├── locales/         # i18n translations
│   │   ├── ar/          # Arabic translations
│   │   └── en/          # English translations
│   ├── providers/       # React providers
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── i18n.ts          # i18n configuration
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # E2E tests
├── public/              # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |
| **State Management** | Zustand + React Query |
| **Styling** | Tailwind CSS + Shadcn/ui |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **i18n** | react-i18next |
| **Date Handling** | date-fns + date-fns-jalali |
| **Testing** | Vitest + Playwright |

## 🌐 API Integration

The frontend connects to the backend API at `http://localhost:8000`.

### Authentication
- Stores JWT token in localStorage
- Auto-adds `Authorization: Bearer <token>` header
- Redirects to login on 401 responses

### Available Endpoints

**Authentication** (`/auth/*`):
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- GET `/auth/me` - Get current user
- POST `/auth/verify-nafath` - Nafath verification

**Customer** (`/customers/*`):
- GET `/customers/me` - Get profile
- GET `/customers/pending-requests` - Get pending requests
- POST `/customers/accept-purchase` - Accept request
- POST `/customers/reject-purchase` - Reject request
- PATCH `/customers/update-limit` - Update credit limit
- POST `/customers/select-repayment-plan` - Select plan
- POST `/customers/make-payment` - Make payment
- GET `/customers/transactions` - Get transactions
- GET `/customers/repayment-plans` - Get plans
- GET `/customers/upcoming-payments` - Get upcoming payments

**Merchant** (`/merchants/*`):
- GET `/merchants/me` - Get profile
- POST `/merchants/send-purchase-request` - Send request
- POST `/merchants/request-settlement` - Request settlement
- GET `/merchants/transactions` - Get transactions
- GET `/merchants/settlements` - Get settlements
- GET `/merchants/pending-requests` - Get pending requests
- GET `/merchants/stats` - Get statistics
- POST `/merchants/branches` - Create branch
- GET `/merchants/branches` - Get branches
- POST `/merchants/lookup-customer` - Lookup customer

## 🎯 Key Features Implementation

### 1. Bilingual Support (Arabic/English)
- Full RTL/LTR layout switching
- Translations in `src/locales/ar/` and `src/locales/en/`
- Language toggle in navbar
- Persists preference to localStorage

### 2. Theme System
- Dark/Light/System modes
- CSS variables for consistent theming
- Persists preference to localStorage
- Smooth transitions

### 3. Currency & Date Formatting
- Saudi Riyal: `1,234.00 SAR`
- Date format: `DD/MM/YYYY`
- Hijri calendar support (display only)
- Timezone: Saudi Arabia (UTC+3)

### 4. State Management
- **Zustand**: Global auth, theme, locale state
- **React Query**: Server state with caching & polling
- **React Hook Form**: Local form state

## 🔐 Authentication Flow

1. User enters email, password, and role (customer/merchant)
2. Frontend calls `/auth/login`
3. Backend returns JWT token + user data
4. Token stored in localStorage
5. User data stored in Zustand auth store
6. All subsequent API calls include token
7. 401 responses trigger logout + redirect

## 📱 Responsive Design

- **Mobile**: < 768px (primary focus)
  - Bottom tab navigation
  - Full-screen modals
  - Stacked layouts
  
- **Tablet**: 768px - 1024px
  - 2-column grids
  - Side drawer navigation
  
- **Desktop**: > 1024px
  - 3-column grids
  - Persistent sidebar
  - Multi-panel layouts

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```

Tests cover:
- Utility functions (currency, date, validation)
- Custom hooks (useAuth, etc.)
- Store logic
- Component rendering

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Tests cover:
- Complete user flows
- Authentication
- Purchase request → Accept → Payment → Settlement
- Mobile/desktop viewports
- RTL layout
- Accessibility

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output in `dist/` directory.

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Environment Variables
Set these in your deployment platform:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_DEFAULT_LANGUAGE` - Default language (ar/en)
- `VITE_DEFAULT_THEME` - Default theme (light/dark)

## 🤝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Use semantic commit messages

### Component Structure
```tsx
// Imports
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Types
interface Props {
  // ...
}

// Component
export function MyComponent({ prop }: Props) {
  const { t } = useTranslation();
  
  // Hooks
  // State
  // Effects
  // Handlers
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Adding New Features
1. Create TypeScript types in `src/types/`
2. Add API service methods in `src/services/`
3. Create custom hooks in `src/hooks/` if needed
4. Build UI components
5. Add translations to `src/locales/`
6. Write tests

## 📄 License

Proprietary - Bareeq Al-Yusr Platform

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS is enabled on backend

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Theme Not Applying
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

---

**Status**: ✅ In Development  
**Version**: 1.0.0  
**Last Updated**: January 2026

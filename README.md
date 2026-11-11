# Avenquo Seller Central — Frontend

A high-performance, enterprise-grade e-commerce merchant authentication and session management portal built with **React**, **strict TypeScript**, and **Tailwind CSS**.

---

## 🚀 Overview

This frontend implements the **Seller Sign-in and Sign-up Authentication** workflows for Avenquo Marketplace, integrating directly with the Spring Boot backend (`AuthController`).

### Key Capabilities

- **Passwordless Authentication**: 6-digit OTP verification sent to merchant business emails.
- **Exact Contract Compliance**: Strictly adheres to the 5 documented backend endpoints under `/api/v1/auth/user`.
- **Automatic Session Restoration**: Proactively restores sessions on page load using single-use refresh token rotation without prompting the user to sign in again.
- **SaaS UX Design**: Inspired by Shopify Polaris and Stripe Dashboard design systems—split-screen layout, responsive mobile design, micro-interactions, custom glassmorphism, and live status indicators.
- **Accessible & Responsive**: Full keyboard navigation, auto-focus, paste auto-fill for OTP, countdown timers, and defensive error normalization.

---

## 🛠️ Tech Stack

- **Framework**: React 18 / 19 with strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom design tokens and dark mode styling
- **Icons**: Lucide React & clean SVG primitives
- **Networking**: Modern Fetch API with structured `ApiClientError` normalization

---

## 📂 Architecture & Directory Structure

```
avenquo-seller-frontend/
├── src/
│   ├── api/
│   │   ├── client.ts             # Typed fetch client with error normalization (APIException & Bean validation)
│   │   └── endpoints.ts          # Centralized endpoint paths matching AuthController
│   ├── components/
│   │   └── ui/
│   │       ├── Alert.tsx         # Modern alerts for success, errors, warnings
│   │       ├── Badge.tsx         # Status & role pills
│   │       ├── Button.tsx        # High-contrast buttons with loading spinners & variants
│   │       ├── Input.tsx         # Input field with inline errors & icon slots
│   │       └── OtpInput.tsx      # 6-box segmented OTP with auto-advance, backspace jump & paste support
│   ├── context/
│   │   └── AuthContext.tsx       # Global auth provider with automatic token refresh on boot
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── AuthHero.tsx           # Split-screen brand hero with seller value propositions
│   │       │   ├── OtpVerificationCard.tsx # OTP entry, 5-min countdown & 30s resend cooldown
│   │       │   ├── SellerSignInForm.tsx   # Sign-in email submission
│   │       │   └── SellerSignUpForm.tsx   # Sign-up registration submission
│   │       ├── hooks/
│   │       │   ├── useAuth.ts             # Auth consumer hook
│   │       │   └── useOtpCountdown.ts     # Expiry and cooldown timer hook
│   │       └── services/
│   │           └── authService.ts         # Direct mappings to backend authentication endpoints
│   ├── pages/
│   │   ├── SellerAuthPage.tsx             # Unified responsive auth page (Sign In / Sign Up / OTP)
│   │   └── SellerDashboardPreviewPage.tsx # Authenticated merchant portal preview & token tester
│   ├── types/
│   │   └── auth.types.ts                  # Strict TypeScript interfaces matching backend DTOs
│   ├── utils/
│   │   ├── tokenStorage.ts                # Token persistence & JWT decoding helper
│   │   └── validation.ts                  # RFC email and 6-digit OTP validators
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔌 API Endpoints Mapping

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/api/v1/auth/user/signup` | `POST` | `{ "email": string }` | Requests signup OTP for merchant account creation |
| `/api/v1/auth/user/verify/signup-otp` | `POST` | `{ "email": string, "otp": string }` | Verifies OTP; activates merchant account (`ROLE_USER`) |
| `/api/v1/auth/user/signin` | `POST` | `{ "email": string }` | Requests sign-in OTP for active accounts |
| `/api/v1/auth/user/verify/signin-otp` | `POST` | `{ "email": string, "otp": string }` | Verifies signin OTP; issues `accessToken` & `refreshToken` |
| `/api/v1/auth/user/refresh` | `POST` | `{ "refreshToken": string }` | Rotates single-use refresh token; returns new pair |

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
# Leave blank for local development using the Vite proxy to http://localhost:8080
VITE_API_BASE_URL=
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, minified production bundle in `dist/`.

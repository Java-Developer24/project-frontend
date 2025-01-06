# PaidSMS Frontend Documentation

## Overview

PaidSMS is a comprehensive SMS verification service platform built with React and Vite. The platform enables users to obtain temporary phone numbers for verification purposes across various online services.

### Key Features
- User authentication (Email/Password and Google OAuth)
- SMS number purchasing and management
- Real-time OTP monitoring
- Wallet recharge system (UPI and TRX)
- Transaction history tracking
- API key management

### Technology Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Authentication**: JWT + Google OAuth
- **HTTP Client**: Axios
- **Form Validation**: 6pp
- **Date Handling**: Moment.js
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone [repository-url]
cd paidsms-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (.env):
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start development server:
```bash
npm run dev
```

## Codebase Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/
│   ├── auth/           # Authentication related components
│   ├── layout/         # Layout components
│   ├── shared/         # Reusable components
│   ├── specific/       # Feature-specific components
│   └── ui/             # UI components (buttons, inputs, etc.)
├── lib/                # Utility functions
├── pages/              # Page components
├── utils/              # Helper functions and context
├── App.jsx            # Root component
└── main.jsx           # Application entry point
```

## Component Documentation

### Authentication Components

#### ProtectRoute
Protected route wrapper component for authenticated routes.

Props:
- `children`: ReactNode
- `user`: Object
- `redirect`: string (default: "/")
- `googleRedirect`: string (optional)
- `isGoogleLogin`: boolean

### Layout Components

#### AppLayout
Main layout wrapper providing consistent page structure.

Props:
- `children`: ReactNode

#### Header
Navigation header component with responsive design.

Props: None

### Core Components

#### RechargeTable
Displays recharge transaction history.

Props:
- `data`: Array<Transaction>
- `currentPage`: number
- `limit`: number

#### PopoverComponent
Reusable popover component for tooltips and notifications.

Props:
- `buttonComponent`: ReactNode
- `popoverContent`: ReactNode
- `delay`: number (default: 2000)
- `open`: boolean
- `setOpen`: function

## API Integration

### Authentication Endpoints

#### Login
```typescript
POST /api/auth/login
Body: {
  email: string
  password: string
  captcha: string
}
Response: {
  token: string
  user: UserObject
}
```

#### Register
```typescript
POST /api/auth/signup
Body: {
  email: string
  password: string
  confirmPassword: string
  captcha: string
}
Response: {
  message: string
}
```

### SMS Service Endpoints

#### Get Number
```typescript
GET /api/service/get-number
Query: {
  api_key: string
  servicecode: string
  server: number
  otpType: string
}
Response: {
  id: string
  number: string
  status: string
}
```

#### Get OTP
```typescript
GET /api/service/get-otp
Query: {
  api_key: string
  id: string
  server: number
}
Response: {
  message: string
  otp: string
}
```

### Payment Endpoints

#### UPI Recharge
```typescript
POST /api/recharge/upi
Body: {
  transactionId: string
  userId: string
  email: string
  amount: number
}
Response: {
  message: string
  balance: number
}
```

#### TRX Recharge
```typescript
GET /api/recharge/trx
Query: {
  transactionHash: string
  userId: string
  email: string
}
Response: {
  message: string
  balance: number
}

## API Integration

### Authentication Endpoints

[Previous auth endpoints remain...]

#### Verify Email
```typescript
GET /api/auth/verify-email
Query: {
  token: string
}
Response: {
  message: string
  jwtToken: string
}
```

#### Validate Token
```typescript
POST /api/auth/validateToken
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  user: UserObject
}
```

#### Google OAuth Login/Signup
```typescript
GET /api/auth/google/login
GET /api/auth/google/signup
Response: Redirects to Google OAuth flow
```

### User Management Endpoints

#### Get User Data
```typescript
GET /api/user/user-data
Query: {
  userId: string
}
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  apiKey: string
  userId: string
  email: string
  trxAddress: string
}
```

#### Change Password
```typescript
POST /api/user/change-password
Body: {
  currentPassword: string
  newPassword: string
  userId: string
  captcha: string
}
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  message: string
}
```

#### Forgot Password Flow
```typescript
POST /api/user/forgot-password
Body: {
  email: string
}
Response: {
  message: string
}

POST /api/user/verify-forgot-otp
Body: {
  email: string
  otp: string
}
Response: {
  message: string
}

POST /api/user/change-password-unauthenticated
Body: {
  email: string
  newPassword: string
}
Response: {
  message: string
}
```

#### Change API Key
```typescript
GET /api/user/change_api_key
Query: {
  apiKey: string
}
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  api_key: string
}
```

### Service Management Endpoints

#### Get Service Data
```typescript
GET /api/service/get-service-server-data
Query: {
  userId?: string
}
Response: Array<ServiceData>
```

#### Check OTP
```typescript
GET /api/server/check-otp
Query: {
  otp: string
  api_key: string
}
Response: {
  results: Array<string>
}
```

### Transaction & History Endpoints

#### Get Recharge History
```typescript
GET /api/history/recharge-history
Query: {
  userId: string
}
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  data: Array<RechargeTransaction>
}
```

#### Get Transaction History
```typescript
GET /api/history/transaction-history
Query: {
  userId: string
}
Headers: {
  Authorization: `Bearer ${token}`
}
Response: {
  data: Array<Transaction>
}
```

#### Get User Transaction History
```typescript
GET /api/history/transaction-history-user
Query: {
  userId: string
}
Response: {
  data: Array<Transaction>
}
```

### Configuration Endpoints

#### Get Minimum UPI Amount
```typescript
GET /api/config/min-upi-amount
Response: {
  minUpiAmount: number
}
```

#### Get Exchange Rate
```typescript
GET /api/recharge/exchange-rate
Response: {
  price: number
}
```

#### Generate QR Code
```typescript
POST /api/recharge/generate-qr
Body: {
  amount: number
}
Response: {
  qrCode: string
}
```

#### Get Maintenance Status
```typescript
GET /api/service/maintenance
Response: {
  maintainance: boolean
}

GET /api/recharge/get-recharge-maintenance
Query: {
  rechargeType: "upi" | "trx"
}
Response: {
  maintenance: boolean
}
```
```

## State Management

The application uses React Context API for state management through `AuthContext`.

### Key Context Providers

#### AuthContext
Manages authentication state and user data.

```javascript
const authContext = {
  user: Object,           // Current user data
  apiKey: string,         // User's API key
  balance: number,        // Wallet balance
  login: Function,        // Login handler
  logout: Function,       // Logout handler
  isGoogleLogin: boolean, // Google auth status
}
```

## Styling Guidelines

The project uses TailwindCSS for styling with custom configuration.

### Theme Configuration
- Custom colors defined in `tailwind.config.js`
- Dark mode support
- Custom animations and transitions

### CSS Classes Structure
- Utility-first approach
- Component-specific styles in separate files
- Global styles in `index.css`

## Testing

### Unit Testing
- Test framework: Vitest
- Component testing with React Testing Library
- Run tests: `npm run test`

### E2E Testing
- Framework: Cypress
- Run E2E tests: `npm run test:e2e`

## Contribution Guidelines

### Code Style
- Use ESLint configuration
- Follow Prettier formatting
- Use TypeScript for new components

### Git Workflow
1. Create feature branch from `develop`
2. Follow conventional commits
3. Submit PR with description
4. Ensure CI passes

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

## Usage Examples

### Protected Route Implementation
```jsx
<ProtectRoute user={user} redirect="/login">
  <Component />
</ProtectRoute>
```

### API Integration Example
```jsx
const fetchData = async () => {
  try {
    const response = await axios.get(`/api/service/get-number`, {
      params: {
        api_key: apiKey,
        servicecode: service,
        server: serverNumber
      }
    });
    // Handle response
  } catch (error) {
    // Handle error
  }
};
```

### Form Implementation
```jsx
const email = useInputValidation("", emailValidator);

<Input
  type="email"
  value={email.value}
  onChange={email.changeHandler}
  error={email.error}
/>
```

## Environment Variables

Required environment variables:
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_RECAPTCHA_SITE_KEY`: ReCAPTCHA site key

## Build and Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Performance Optimization

- Lazy loading of components
- Image optimization
- Code splitting
- Memoization of expensive computations

## Security Measures

- JWT token validation
- CAPTCHA implementation
- API key protection
- XSS prevention
- CSRF protection

## Troubleshooting

Common issues and solutions:

1. Authentication Issues
   - Clear localStorage
   - Check token expiration
   - Verify API endpoints

2. Payment Integration
   - Verify transaction IDs
   - Check network connectivity
   - Validate amount formats

3. SMS Service
   - Verify API key validity
   - Check service availability
   - Monitor number expiration

## Changelog

### Version 1.0.0
- Initial release
- Basic authentication
- SMS service integration
- Payment system implementation
- Transaction history
- API key management

### Version 1.1.0
- Google OAuth integration
- UPI payment improvements
- Real-time OTP monitoring
- Enhanced error handling
- Performance optimizations
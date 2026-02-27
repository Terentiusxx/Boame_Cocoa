# Boame Cocoa - Disease Detection Scanner

A Next.js web application for detecting and managing cocoa plant diseases using AI-powered image analysis.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI**: React 19

## 📁 Project Structure

```
boame_cocoa/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles & CSS variables
│   └── signup/              # Sign up page
├── lib/                      # Shared utilities and configurations
│   ├── constants.ts         # App-wide constants (routes, API endpoints, etc.)
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions (formatters, validators, etc.)
├── components/              # Reusable React components (create as needed)
├── public/                  # Static assets
│   └── img/                 # Images
├── .env.local              # Environment variables (create from .env.local.example)
└── package.json            # Dependencies
```

## 🎨 Design System

### Color Palette

Defined in `app/globals.css` using CSS custom properties:

**Brand Colors:**
- `--primary`: #2E7D32 (Deep Green)
- `--primary-dark`: #1B5E20
- `--primary-light`: #4CAF50
- `--secondary`: #8D6E63 (Brown - Cocoa)
- `--accent`: #FFC107 (Amber)

**Background Colors:**
- `--background`: #FFFFFF
- `--background-light`: #E8F5E9 (Light mint green)

**Text Colors:**
- `--foreground`: #212121
- `--foreground-light`: #757575

**Status Colors:**
- `--success`: #4CAF50
- `--error`: #F44336
- `--warning`: #FF9800
- `--info`: #2196F3

### Using Colors in Components

```tsx
// Using CSS variables
<div className="bg-background-light text-primary">

// Using Tailwind classes
<button className="bg-primary hover:bg-primary-dark">
```

### Typography

Defined font sizes, spacing, border radius, and shadows in `globals.css`.

## 📝 Constants & Configuration

All app-wide constants are defined in `lib/constants.ts`:

- **Routes**: Centralized route definitions
- **API Endpoints**: API URL structure
- **Disease Types**: Cocoa disease classifications
- **Validation Rules**: Form validation patterns
- **Image Upload**: File size and format restrictions

### Usage Example

```tsx
import { ROUTES, COCOA_DISEASES } from '@/lib/constants';

<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
```

## 🔧 Utility Functions

Common utilities in `lib/utils.ts`:

- `cn()`: Merge Tailwind classes
- `formatDate()`: Date formatting
- `isValidEmail()`: Email validation
- `isStrongPassword()`: Password validation
- `formatFileSize()`: File size formatting
- `getDiseaseDisplayName()`: Disease type converter

### Usage Example

```tsx
import { cn, isValidEmail } from '@/lib/utils';

const classes = cn('bg-primary', isActive && 'bg-primary-dark');
const valid = isValidEmail(email);
```

## 📋 TypeScript Types

Shared types and interfaces in `lib/types.ts`:

- User types
- Authentication types
- Scan/Disease detection types
- API response types
- Form state types

### Usage Example

```tsx
import { User, ScanResult } from '@/lib/types';

const user: User = { ... };
```

## 🌍 Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key
```

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your values
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Current Pages

- `/` - Home page
- `/signup` - User registration

## 🛠️ Common Development Patterns

### Creating a New Page

```tsx
// app/newpage/page.tsx
import { ROUTES } from '@/lib/constants';

export default function NewPage() {
  return <div>New Page</div>;
}
```

### Creating a Reusable Component

```tsx
// components/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary' }: ButtonProps) {
  return (
    <button className={cn(
      'px-6 py-3 rounded-full font-semibold',
      variant === 'primary' && 'bg-primary text-white',
      variant === 'secondary' && 'bg-secondary text-white'
    )}>
      {children}
    </button>
  );
}
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📖 Best Practices

1. ✅ Use constants from `lib/constants.ts` instead of hardcoded values
2. ✅ Use CSS variables for colors (e.g., `bg-primary` not `bg-[#2E7D32]`)
3. ✅ Define TypeScript interfaces in `lib/types.ts`
4. ✅ Use utility functions from `lib/utils.ts`
5. ✅ Keep components small and reusable
6. ✅ Use proper TypeScript typing
7. ✅ Follow the established folder structure

## 🔮 Next Steps

- [ ] Create login page
- [ ] Set up authentication system
- [ ] Build dashboard
- [ ] Implement disease scanning feature
- [ ] Add history/results page
- [ ] Integrate ML model API
- [ ] Add user profile management

## 📄 License

Private - All rights reserved

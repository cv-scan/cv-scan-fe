# CV Scan FE - Claude Code Project Guide

## Project Overview
Frontend for CV Scan application - AI-powered resume evaluation against job descriptions.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS v4 (pure, no UI library)
- **Routing**: React Router v6
- **Server state**: TanStack Query v5
- **Client state**: Zustand (with persist)
- **HTTP**: Axios with JWT interceptors
- **Forms**: React Hook Form + Zod
- **Auth**: JWT + Refresh Token (localStorage)

## Development Commands
```bash
npm run dev      # Start dev server on port 3001
npm run build    # TypeScript check + build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Backend API
- Base URL: `http://localhost:3000/api/v1`
- Auth: Bearer JWT token in Authorization header
- Refresh endpoint: `POST /auth/refresh`

## Key Architecture Decisions
- All API calls go through `src/services/api.ts` (axios instance with interceptors)
- Auth state managed in Zustand store (`src/store/auth.store.ts`) with localStorage persistence
- Protected routes use `ProtectedRoute` component that redirects to `/login` if not authenticated
- TanStack Query handles all server state (caching, refetching, mutations)
- Forms use React Hook Form with Zod schemas for validation

## Directory Structure
- `src/components/ui/` - Reusable UI primitives (Button, Input, Modal, Badge, Spinner, Card)
- `src/components/layout/` - Layout components (MainLayout, Sidebar, Header, ProtectedRoute)
- `src/components/cv/` - CV-specific components
- `src/components/jd/` - Job Description components
- `src/components/evaluation/` - Evaluation/scoring components
- `src/pages/` - Page-level components
- `src/services/` - API service functions
- `src/store/` - Zustand stores
- `src/types/` - TypeScript types
- `src/hooks/` - Custom hooks
- `src/utils/` - Utilities (cn helper, etc.)

## Coding Conventions
- Use `cn()` utility from `src/utils/cn.ts` for conditional Tailwind classes
- Service functions return typed responses using types from `src/types/index.ts`
- All pages that require auth are wrapped in `<ProtectedRoute>`
- Use TanStack Query mutations for POST/PUT/DELETE operations

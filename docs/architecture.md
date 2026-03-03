# Architecture Overview

## Frontend Architecture

### Data Flow
```
User Action → Component → TanStack Query / Zustand → Service → Axios → Backend API
```

### Auth Flow
1. User submits login form
2. `authService.login()` called → backend returns `{ accessToken, refreshToken, user }`
3. Tokens stored in Zustand store (persisted to localStorage)
4. Axios interceptor adds `Authorization: Bearer {token}` to all requests
5. On 401, interceptor tries `POST /auth/refresh` with refreshToken
6. If refresh succeeds, retry original request with new token
7. If refresh fails, clear store and redirect to `/login`

### State Management
- **Server state**: TanStack Query (caching, background refetch, optimistic updates)
- **Client state**: Zustand (auth, UI state)
- **Form state**: React Hook Form (local, validated with Zod)

### Component Hierarchy
```
App (Router)
├── Public Routes
│   ├── /login → LoginPage
│   └── /register → RegisterPage
└── ProtectedRoute
    └── MainLayout
        ├── Sidebar
        ├── Header
        └── Page Content
            ├── /dashboard → DashboardPage
            ├── /jd → JDListPage
            ├── /jd/new → JDCreatePage
            ├── /jd/:id → JDDetailPage
            ├── /cv → CVListPage
            ├── /cv/upload → CVUploadPage
            ├── /cv/:id → CVDetailPage
            ├── /evaluations → EvalListPage
            └── /evaluations/:id → EvalDetailPage
```

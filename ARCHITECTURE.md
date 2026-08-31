# Frontend Architecture

This document describes the structure of the CV-Connect web frontend so a new developer can find their way around quickly.

## Stack

- **React 19** with Vite (dev server + production build)
- **React Router DOM 7** for client-side routing
- **Axios** for HTTP (`src/utils/axios.js` attaches the JWT from `localStorage` to every request)
- **Socket.io client** for real-time messaging/notifications
- **Vitest + Testing Library** for tests, **ESLint 9 flat config** for linting

## Directory layout

```
src/
├── App.jsx            # Router setup, providers, top-level layout
├── main.jsx           # React entry point
├── components/        # All UI components (pages and shared pieces)
├── contexts/          # React contexts (AuthContext, LoadingContext)
└── utils/             # axios instance, visitor tracking
```

There is no `pages/` directory — route-level components live in `src/components/` alongside shared components.

## Providers and routing

`src/App.jsx` wraps the router in two providers:

- `AuthProvider` (`src/contexts/AuthContext.jsx`) — login/logout state and the auth token
- `LoadingProvider` (`src/contexts/LoadingContext.jsx`) — page-transition loading flag

Routes are declared in `App.jsx`. Protected routes use `ProtectedRoute`, which supports a `requiredRole` prop (`freelancer`, `associate`, `admin`, `ecs_employee`) and redirects unauthenticated/insufficient-role users to login.

### Main routes

| Path | Access | Component |
|---|---|---|
| `/` | public | `MainPage` |
| `/register`, `/login` | public | auth screens |
| `/forgot-password`, `/reset-password` | public | password recovery |
| `/freelancer-dashboard`, `/freelancer/*` | freelancer | freelancer area (profile, CV upload, edit) |
| `/associate/dashboard` | associate | associate area |
| `/ecs-employee-dashboard` | ecs_employee | ECS employee area |
| `/admin/dashboard` | admin | admin area (analytics, users) |

## HTTP and API conventions

- Single axios instance in `src/utils/axios.js`; `VITE_API_URL` sets the base URL
- Backend responses follow `{ success: boolean, ...payload }` — components check `response.data.success` before using payloads
- JWT is stored in `localStorage` (`token` key) and attached by the axios interceptor
- 401 responses redirect to login (handled in the interceptor)

## State management

State is kept local to components with hooks — there is no Redux. Cross-cutting state lives in the two contexts above. Data is fetched inside components with `useCallback`-memoized functions called from `useEffect` (the lint rules enforce correct dependency arrays; see "Code Quality" in the README).

## Conventions

- ESLint flat config (`eslint.config.js`) with `react-hooks` and `react-refresh` plugins
- `npm run lint` fails on **any** warning (`--max-warnings 0`); Husky `lint-staged` enforces the same pre-commit
- CI (`.github/workflows/ci.yml`) runs lint + build on every PR to `main`
- Tests live in `tests/` (Vitest, jsdom environment) — run with `npm test`

## Related repositories

- `cv-connect-backend` — Express + PostgreSQL API
- `cv-connect-mobile` — React Native (Expo) client

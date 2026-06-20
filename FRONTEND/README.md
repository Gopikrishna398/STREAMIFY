# Streamify Frontend

The frontend is a React and Vite application for the Streamify language exchange platform. It handles routing, authentication checks, onboarding, profile editing, friend discovery, notifications, realtime chat, video calls, call history, and theme selection.

## Responsibilities

### Routing and Protection

`src/App.jsx` defines every route and decides where the user should go based on authentication state.

The route guards follow this order:

1. If there is no authenticated user, send the user to `/login`.
2. If the user is logged in but email is not verified, send the user to `/verify-email`.
3. If the user is verified but not onboarded, send the user to `/onboarding`.
4. If all checks pass, render the protected page inside the shared layout.

This keeps private pages unavailable until the account is ready.

### API Access

`src/lib/axios.js` creates the Axios client. In development it points to `http://localhost:5001/api`. In production it uses `VITE_API_URL` and automatically appends `/api` when needed.

`src/lib/api.js` contains named functions for each backend action. Components and hooks call these functions instead of hardcoding request details.

### Server State

TanStack React Query is used for loading and caching backend data. Authentication, friends, recommendations, notifications, call history, and Stream tokens are all treated as server state.

### Theme State

Zustand stores the selected DaisyUI theme in `src/store/useThemeStore.js`. The app applies the selected theme through the root `data-theme` attribute.

### Chat and Calls

The chat pages use Stream Chat packages to connect authenticated users to Stream conversations. Video call pages use the Stream Video React SDK. The frontend requests a Stream token from the backend before connecting to Stream services.

### Notifications

The frontend displays counts and notification UI for incoming friend requests, unread messages, and missed calls. It also uses toast messages for action feedback.

## Source Structure

```text
src/
  assets/       Static image and SVG assets imported by React
  components/   Reusable app UI such as Navbar, Sidebar, Avatar, loaders, and call controls
  constants/    Shared constants such as language/theme lists
  hooks/        Reusable hooks for auth, login, logout, signup, and unread counts
  lib/          Axios setup, API helpers, and utilities
  pages/        Full route screens
  store/        Zustand state stores
  App.jsx       Routes, auth guards, and layout decisions
  main.jsx      React app entry point
  index.css     Tailwind and global styles
```

## Pages

| Page | Route | Purpose |
| --- | --- | --- |
| `LoginPage` | `/login` | Lets existing users sign in. |
| `SignupPage` | `/signup` | Creates a new account. |
| `VerifyEmailPage` | `/verify-email` | Accepts the OTP sent after signup or login. |
| `OnboardingPage` | `/onboarding` | Collects profile details required before using the app. |
| `HomePage` | `/` | Shows recommended language partners and friend actions. |
| `MessagesPage` | `/messages` | Shows recent conversations. |
| `NewChatPage` | `/new-chat` | Starts a new chat from friends. |
| `ChatPage` | `/chat/:id` | Opens a one-to-one Stream chat. |
| `CallPage` | `/call/:id` | Opens a Stream video call. |
| `CallsPage` | `/calls` | Shows call history and missed call state. |
| `NotificationsPage` | `/notifications` | Shows friend request notifications. |
| `ProfilePage` | `/profile` | Lets users edit profile details and profile picture. |

## Main Components

| Component | Purpose |
| --- | --- |
| `LayOut` | Wraps protected pages with shared navigation and optional sidebar. |
| `Navbar` | Top-level navigation and action area. |
| `Sidebar` | Main app navigation for protected pages. |
| `UserAvatar` | Displays user profile images and fallbacks consistently. |
| `ProfilePictureEditor` | Handles profile picture selection and preview. |
| `FriendCard` | Displays user/friend details and friend actions. |
| `CallButton` | Starts a video call flow from chat. |
| `MessageNotifier` | Handles message notification behavior. |
| `ThemeSelector` | Lets users switch DaisyUI themes. |
| `PageLoader` and `ChatLoader` | Show loading states while data or Stream UI loads. |
| `NoFriendsFound` and `NoNotificationsFound` | Empty states for missing data. |

## Environment Variables

Create `FRONTEND/.env` only when the frontend needs to call a deployed backend directly:

```env
VITE_API_URL=https://your-backend-domain.com
```

In local development, the frontend automatically uses the backend at `http://localhost:5001/api`.

## Run Locally

```bash
npm install
npm run dev
```

The app starts on `http://localhost:5173` by default.

## Build and Preview

```bash
npm run build
npm run preview
```

`npm run build` creates the production files in `dist`.

## Lint

```bash
npm run lint
```

This runs ESLint across the frontend source.

## Deployment Notes

The project includes `vercel.json` with two important rules:

- `/api/:path*` is rewritten to the deployed backend API.
- All other routes are rewritten to `/index.html` so React Router can handle client-side routes.

When using a different backend URL, update the rewrite destination or set `VITE_API_URL` in the deployment environment.

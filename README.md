# Streamify

Streamify is a full-stack language exchange platform for finding learning partners, sending friend requests, chatting in real time, and starting video calls from conversations.

The project is split into two applications:

- `BACKEND`: Express, MongoDB, authentication, user/friend APIs, Stream token generation, call records, email verification, and Cloudinary profile image uploads.
- `FRONTEND`: React, Vite, Tailwind CSS, DaisyUI, protected routes, profile/onboarding screens, friend discovery, messaging, notifications, video calls, and theme selection.

## What the App Does

### Authentication and Email Verification

Users create an account with a full name, email, and password. Passwords are hashed with `bcryptjs` before they are stored in MongoDB. After signup, the backend creates a JWT and stores it in an HTTP-only cookie so the frontend can stay authenticated without manually storing tokens in browser storage.

New accounts must verify their email with a 6-digit OTP. The backend sends the OTP through Brevo when email credentials are configured. If Brevo is not configured, the OTP is logged to the backend console so local development is still possible.

### Onboarding

After verification, users complete onboarding by adding profile details such as bio, native language, learning language, location, gender, and an optional profile picture. Only onboarded users are recommended to other learners, which keeps discovery focused on complete profiles.

### Profile Management

Users can update their profile after onboarding. Profile image uploads are sent as image data URLs and uploaded to Cloudinary by the backend. MongoDB stores the final Cloudinary URL, not the raw image data.

### Friend Discovery

The home page recommends other onboarded users who are not already friends with the current user. A user can send a friend request, view outgoing requests, accept incoming requests, and build a friend list.

### Realtime Chat

Stream Chat handles one-to-one messaging. The backend generates Stream user tokens for authenticated users, and the frontend uses those tokens to connect to Stream securely.

### Video Calls and Call History

Stream Video powers calls. Users can start a call from a chat, and the backend stores a call record with the caller, participants, Stream call ID, channel ID, status, and seen state. The calls page can show recent call history and missed call counts.

### Notifications

The app has notifications for friend requests, message activity, and missed calls. Notification counts are loaded from backend APIs and shown in the frontend navigation experience.

## Tech Stack

### Frontend

- React 19 for UI
- Vite for development and builds
- React Router for routing
- TanStack React Query for server state and caching
- Axios for backend API calls
- Zustand for theme state
- Tailwind CSS and DaisyUI for styling
- Stream Chat React SDK for chat UI
- Stream Video React SDK for calls
- React Hot Toast for user feedback
- Lucide React for icons

### Backend

- Node.js and Express for the API server
- MongoDB and Mongoose for persistence
- JWT for authentication
- HTTP-only cookies for auth session storage
- Zod for request validation
- Helmet for security headers
- Express Rate Limit for API rate limiting
- CORS configured through allowed client origins
- Stream Chat server SDK for Stream users and tokens
- Cloudinary for profile image uploads
- Brevo API for verification emails

## Project Structure

```text
STREAMIFY/
  BACKEND/
    src/
      config/       External service and database configuration
      controllers/  Request handlers for auth, users, chat, and calls
      middleware/   Auth and validation middleware
      models/       Mongoose schemas
      routes/       Express route definitions
      validators/   Zod request schemas
      index.js      Loads environment variables and starts the server
      server.js     Builds and runs the Express app
  FRONTEND/
    src/
      components/   Reusable UI components
      constants/    Shared frontend constants
      hooks/        Reusable React Query/auth hooks
      lib/          Axios and API helper functions
      pages/        Route-level screens
      store/        Zustand stores
      App.jsx       App routes and auth guards
      main.jsx      React entry point
  PROJECT_REVIEW.md Project review and presentation notes
```

## Local Setup

### 1. Install Backend Dependencies

```bash
cd BACKEND
npm install
```

### 2. Create Backend Environment File

Create `BACKEND/.env`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=replace_with_a_strong_secret
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Streamify
```

Cloudinary and Brevo are optional for basic local testing, but profile image upload and real verification emails require them.

### 3. Start the Backend

```bash
npm run dev
```

The backend runs on `http://localhost:5001` by default.

### 4. Install Frontend Dependencies

```bash
cd ../FRONTEND
npm install
```

### 5. Create Frontend Environment File

Create `FRONTEND/.env` when running against a deployed backend:

```env
VITE_API_URL=https://your-backend-domain.com
```

During local development, the frontend automatically calls `http://localhost:5001/api`, so this variable is usually not needed.

### 6. Start the Frontend

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Main User Flow

1. User signs up.
2. Backend creates the account, sends an OTP, and sets the JWT cookie.
3. User verifies email with the OTP.
4. User completes onboarding.
5. User sees recommended language partners.
6. User sends or accepts friend requests.
7. Friends can open chat conversations.
8. Users can start video calls from chat.
9. Calls are stored in backend call history.
10. Notifications and counts keep the user aware of requests, messages, and missed calls.

## Useful Commands

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Deployment Notes

- Deploy the backend to a Node-friendly host such as Railway, Render, or Fly.io.
- Deploy the frontend to Vercel or Netlify.
- Set `CLIENT_ORIGINS` on the backend to include the deployed frontend URL.
- Set `VITE_API_URL` on the frontend to the deployed backend URL, unless using a platform rewrite.
- Use `NODE_ENV=production` so cookies use production-safe settings.
- Make sure Stream, Cloudinary, Brevo, MongoDB, and JWT secrets are configured in the hosting provider.

## Current Limitations

- There are no automated tests yet.
- Password reset is not implemented.
- Browser push notifications are not implemented.
- Call records track started calls, but they do not yet store detailed duration or end metadata.
- Admin moderation features such as blocking, reporting, or user management are not included.

## Good Next Improvements

- Add backend tests for authentication, friend requests, profile updates, and call records.
- Add frontend tests for protected route behavior and important page states.
- Add password reset through email.
- Add browser push notifications and notification preferences.
- Track call end time and call duration.
- Add search and filtering for users, messages, and call history.

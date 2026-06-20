# Streamify Project Review

## Project Overview

Streamify is a full-stack language exchange and communication platform. Users can create an account, verify their email, complete onboarding, discover other language learners, send friend requests, chat with friends, receive notifications, manage their profile, upload a profile picture, and start video calls.

The project uses a MERN-style architecture:

- Frontend: React, Vite, Tailwind CSS, DaisyUI, React Router
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT stored in HTTP-only cookies
- Validation and security: Zod, Helmet, Express Rate Limit, CORS
- Realtime chat: Stream Chat
- Video calls: Stream Video SDK
- Media upload: Cloudinary
- Email verification: Brevo API
- State/query management: TanStack React Query and Zustand

The project is stronger than a basic CRUD app because it combines authentication, protected routing, onboarding, social networking, realtime messaging, video calls, notifications, file upload, third-party API integration, and production-oriented middleware.

## Main Features

### Authentication and Email Verification

Users can create an account, log in, log out, and stay authenticated with a JWT cookie. The cookie is HTTP-only, so frontend JavaScript cannot directly read the token.

After signup, the backend generates a 6-digit OTP that expires after 15 minutes. The OTP is sent by Brevo when email credentials are configured. For local development, the OTP can be logged to the backend console if Brevo is not configured.

The protected frontend flow is:

1. Unauthenticated users go to `/login`.
2. Logged-in but unverified users go to `/verify-email`.
3. Verified but not-onboarded users go to `/onboarding`.
4. Fully ready users can access the main app.

### Onboarding

After verification, users complete their profile by adding:

- Full name
- Bio
- Native language
- Learning language
- Location
- Gender
- Optional profile picture

Only onboarded users appear in recommendations. This keeps discovery focused on profiles that are useful to other learners.

### Profile Management

Users can update profile information after onboarding. Profile pictures are uploaded to Cloudinary through the backend. The frontend sends image data, Cloudinary stores and optimizes the image, and MongoDB stores the final hosted image URL.

### User Discovery and Friends

Users can view recommended language learners, send friend requests, accept incoming requests, see outgoing requests, and view their current friends. When a request is accepted, both users are added to each other's `friends` list in MongoDB.

### Messaging

Stream Chat powers realtime one-to-one messaging. The backend creates Stream users and generates Stream tokens. The frontend uses those tokens to connect to Stream securely.

Users can open conversations, send and receive messages, view recent conversations, and receive in-app message notifications.

### Video Calls and Call History

Stream Video powers video calls. Users can start a call from a chat. The backend stores call records in MongoDB using a dedicated `Call` model.

Each call record stores:

- Caller
- Participants
- Stream call ID
- Stream channel ID
- Status
- Users who have seen the call
- Created and updated timestamps

The Calls page can show recent call history and missed call counts.

### Notifications

The app includes notification behavior for friend requests, messages, and missed calls. Friend request counts and missed call counts come from backend APIs. Message notification behavior is handled in the frontend with Stream events and UI feedback.

### Theme Support

The app supports DaisyUI themes. Zustand stores the selected theme, and the frontend applies it through the root `data-theme` attribute.

## Backend Structure

- `src/index.js`
  Loads `BACKEND/.env` and imports the server.

- `src/server.js`
  Configures Express, Helmet, rate limiting, CORS, JSON parsing, URL-encoded parsing, cookies, routes, MongoDB connection, and the HTTP listener.

- `src/config/db.js`
  Connects the backend to MongoDB through Mongoose.

- `src/config/stream.js`
  Configures Stream Chat server SDK, creates or updates Stream users, and generates Stream user tokens.

- `src/config/cloudinary.js`
  Uploads profile images to Cloudinary and returns optimized image URLs.

- `src/config/email.js`
  Sends email verification OTPs through Brevo, with console logging as a development fallback.

- `src/models/user.model.js`
  Defines users, profile fields, email verification fields, friend references, password hashing, and password comparison.

- `src/models/friendRequest.model.js`
  Defines friend requests between users and tracks request status.

- `src/models/call.model.js`
  Stores call history records for Stream video calls.

- `src/controllers/auth.controller.js`
  Handles signup, login, logout, email verification, OTP resend, and onboarding.

- `src/controllers/user.controller.js`
  Handles recommendations, friends, friend requests, notification count, profile updates, and user lookup.

- `src/controllers/chat.controller.js`
  Handles Stream token generation, call history, missed call count, call creation, and seen state.

- `src/middleware/auth.middleware.js`
  Protects private routes by reading and verifying the JWT cookie.

- `src/middleware/validate.middleware.js`
  Validates request bodies with Zod before controller logic runs.

- `src/validators`
  Defines schemas for signup, login, onboarding, profile updates, and call creation.

## Frontend Structure

- `src/App.jsx`
  Defines app routes and protected-route behavior.

- `src/pages`
  Contains route-level screens such as Login, Signup, Verify Email, Onboarding, Home, Messages, Chat, Calls, Call, Notifications, and Profile.

- `src/components`
  Contains reusable UI such as Navbar, Sidebar, Layout, Avatar, Friend Card, Call Button, Theme Selector, loaders, empty states, profile picture editor, and notification helpers.

- `src/lib/api.js`
  Contains named functions for backend API calls.

- `src/lib/axios.js`
  Configures Axios base URL and cookie credentials.

- `src/hooks`
  Contains reusable auth and request hooks.

- `src/store/useThemeStore.js`
  Stores the selected DaisyUI theme.

## API Summary

### Auth API

- `POST /api/auth/signup`: creates an account, sends OTP, and sets auth cookie.
- `POST /api/auth/login`: authenticates user, sets auth cookie, and resends OTP if needed.
- `POST /api/auth/logout`: clears auth cookie.
- `POST /api/auth/onboarding`: saves profile details and marks user as onboarded.
- `POST /api/auth/verify-email`: verifies the current user's OTP.
- `POST /api/auth/resend-otp`: sends a new OTP.
- `GET /api/auth/me`: returns the authenticated user.

### User API

- `GET /api/users`: returns recommended onboarded users.
- `GET /api/users/friends`: returns the current user's friends.
- `POST /api/users/friend-request/:id`: sends a friend request.
- `PUT /api/users/friend-request/:id/accept`: accepts a friend request.
- `GET /api/users/friend-requests`: returns incoming and accepted requests.
- `GET /api/users/notification-count`: returns pending request count.
- `GET /api/users/outgoing-friend-requests`: returns outgoing pending requests.
- `PATCH /api/users/profile`: updates profile details and profile picture.
- `GET /api/users/:id`: returns one user by ID.

### Chat and Call API

- `GET /api/chat/token`: returns a Stream token.
- `GET /api/chat/calls`: returns recent call history.
- `GET /api/chat/calls/missed-count`: returns unseen call count.
- `POST /api/chat/calls`: creates a call record.
- `PUT /api/chat/calls/seen`: marks calls as seen.

## Why This Is Good for a Final-Year Project

Streamify is a strong final-year project because it demonstrates:

- Secure authentication with JWT and HTTP-only cookies
- Password hashing
- Email verification
- Protected backend routes
- Protected frontend routes
- MongoDB schema design
- Request validation
- Friend request workflow
- Realtime chat integration
- Video call integration
- Profile image upload
- Notification counts
- Responsive frontend UI
- External service integration
- Deployment-aware configuration

It gives you enough material to explain system design, frontend/backend communication, authentication, database relationships, realtime features, and production hardening.

## Current Strengths

- Full-stack architecture with clear frontend and backend separation
- Real-world social communication use case
- JWT cookie authentication
- Email verification flow
- Onboarding flow
- Friend request system
- Realtime chat and video calls through Stream
- Cloudinary profile uploads
- Zod request validation
- Security middleware with Helmet and rate limiting
- Call history model
- Theme support

## Current Limitations

- Automated tests are not added yet.
- Password reset is not implemented yet.
- Browser push notifications are not implemented yet.
- Call records can be expanded with duration, end time, and richer statuses.
- Error responses are not fully standardized across all controllers.
- Some production deployment values still need careful environment configuration.
- Admin/moderation features such as block, report, and user management are not included.

## Suggestions to Improve Further

### 1. Add Tests

Add focused tests for authentication, route protection, friend requests, profile updates, and call records. Even a small test suite improves confidence and makes the project stronger for interviews.

Useful tools:

- Vitest or Jest
- React Testing Library
- Supertest

### 2. Add Password Reset

A production communication app should let users reset forgotten passwords through email. This can reuse the existing email provider pattern.

### 3. Expand Call History

The current call model is useful, but it can become richer by storing:

- Start time
- End time
- Duration
- Missed/completed/cancelled status
- User who ended the call

### 4. Improve Notification System

Add browser push notifications, notification preferences, sound controls, and a notification history page.

### 5. Improve Error Consistency

Use one response shape for backend errors, such as:

```json
{
  "success": false,
  "message": "Something went wrong",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

This makes frontend error handling easier.

### 6. Add Search and Filters

Useful additions include user search, language filters, message search, and call history filters.

### 7. Add Moderation Features

For a real social app, useful moderation features include blocking users, reporting users, and admin review tools.

## Suggested Presentation Flow

1. Problem statement:
   Language learners need a way to find partners, chat, and practice speaking.

2. Solution:
   Streamify connects learners through profiles, friend requests, realtime chat, and video calls.

3. Tech stack:
   React frontend, Express backend, MongoDB database, Stream for chat/video, Cloudinary for profile uploads, Brevo for emails.

4. Key modules:
   Authentication, verification, onboarding, discovery, friends, messaging, calls, notifications, profile management.

5. Security:
   HTTP-only JWT cookies, password hashing, protected routes, validation, Helmet, rate limiting, CORS.

6. Challenges:
   Integrating Stream, managing auth state, protecting routes, handling cookies across frontend/backend deployments, and connecting multiple external services.

7. Future scope:
   Tests, password reset, push notifications, richer call records, search, moderation, and deployment polishing.

## Final Verdict

Streamify is a strong final-year and portfolio project. It goes beyond CRUD and shows practical full-stack development with authentication, database modeling, realtime communication, video calling, file upload, email verification, and external API integration.

For placement discussions, focus on explaining why each module exists, how data moves between frontend and backend, how authentication is protected, how Stream is integrated, and what improvements you would make before production.

# Streamify Backend

The backend is an Express API that handles authentication, email verification, onboarding, user discovery, friend requests, Stream token generation, call records, and profile image uploads.

## Responsibilities

### Authentication

The backend creates and verifies user sessions with JWT. When a user signs up or logs in, the server signs a token with `JWT_SECRET_KEY` and stores it in a `jwt` HTTP-only cookie.

The cookie is configured differently depending on the request environment:

- In local HTTP development, `sameSite` is `lax` and `secure` is false.
- In production or HTTPS requests, `sameSite` is `none` and `secure` is true so cross-site frontend/backend deployments can still send cookies.

### Email Verification

Signup creates a 6-digit OTP that expires after 15 minutes. The backend sends the OTP with Brevo when `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are set. Without those variables, the OTP is printed to the console for local testing.

Users must verify their email before accessing the main app experience.

### Onboarding

Onboarding completes the user profile. The backend requires full name, bio, native language, learning language, location, and gender. It can also accept a base64 image data URL for `profilePic`; when provided, the image is uploaded to Cloudinary and the resulting URL is stored on the user document.

### Users and Friends

The user routes support:

- Recommended users
- Friend list
- Sending friend requests
- Accepting friend requests
- Incoming and outgoing request lists
- Notification count for pending friend requests
- Profile updates
- Loading a user by ID

Friend relationships are stored in each user's `friends` array after a request is accepted.

### Chat and Calls

Stream Chat and Stream Video handle realtime communication. The backend does not store chat messages itself; Stream stores and serves them. The backend does generate Stream tokens so authenticated users can connect to Stream.

Call history is stored in MongoDB through the `Call` model. Each record contains the caller, participants, Stream call ID, channel ID, status, seen users, and timestamps.

## Source Structure

```text
src/
  config/
    cloudinary.js  Configures profile image uploads
    db.js          Connects to MongoDB
    email.js       Sends verification OTP emails through Brevo
    stream.js      Configures Stream Chat server SDK
  controllers/
    auth.controller.js  Signup, login, logout, OTP, onboarding
    user.controller.js  Discovery, friends, requests, profile
    chat.controller.js  Stream tokens and call records
  middleware/
    auth.middleware.js      JWT cookie protection
    validate.middleware.js  Zod validation middleware
  models/
    call.model.js           Call history schema
    friendRequest.model.js  Friend request schema
    user.model.js           User schema and password helpers
  routes/
    auth.route.js  `/api/auth` routes
    user.route.js  `/api/users` routes
    chat.route.js  `/api/chat` routes
  validators/
    auth.validator.js  Auth, onboarding, and profile schemas
    chat.validator.js  Call creation schema
  index.js   Loads `.env` and imports the server
  server.js  Builds middleware, routes, DB connection, and listener
```

## Environment Variables

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

### Required for Core App

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET_KEY`: Secret used to sign authentication tokens.
- `STREAM_API_KEY` and `STREAM_API_SECRET`: Required for chat and video token generation.

### Required for Optional Features

- Cloudinary variables are required for profile picture uploads.
- Brevo variables are required to send real verification emails.

## API Routes

### Auth Routes

Base path: `/api/auth`

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/signup` | No | Creates a user, sends OTP, sets auth cookie. |
| `POST` | `/login` | No | Authenticates user, sets auth cookie, resends OTP if unverified. |
| `POST` | `/logout` | No | Clears the auth cookie. |
| `POST` | `/onboarding` | Yes | Completes user profile and marks user as onboarded. |
| `POST` | `/verify-email` | Yes | Verifies the signed-in user's OTP. |
| `POST` | `/resend-otp` | Yes | Generates and sends a new OTP. |
| `GET` | `/me` | Yes | Returns the currently authenticated user. |

### User Routes

Base path: `/api/users`

All user routes require authentication.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Returns recommended onboarded users who are not already friends. |
| `GET` | `/friends` | Returns the current user's friends. |
| `POST` | `/friend-request/:id` | Sends a friend request to another user. |
| `PUT` | `/friend-request/:id/accept` | Accepts an incoming friend request. |
| `GET` | `/friend-requests` | Returns incoming pending requests and accepted requests. |
| `GET` | `/notification-count` | Returns the count of pending incoming friend requests. |
| `GET` | `/outgoing-friend-requests` | Returns pending requests sent by the current user. |
| `PATCH` | `/profile` | Updates profile fields and optionally uploads a new profile picture. |
| `GET` | `/:id` | Returns one user by MongoDB ID. |

### Chat and Call Routes

Base path: `/api/chat`

All chat routes require authentication.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/token` | Returns a Stream token for the authenticated user. |
| `GET` | `/calls` | Returns recent call history for the authenticated user. |
| `GET` | `/calls/missed-count` | Returns unseen call count where another user was the caller. |
| `POST` | `/calls` | Creates a call record. |
| `PUT` | `/calls/seen` | Marks all current user's calls as seen. |

## Validation

The backend uses Zod schemas in `src/validators`. The `validate` middleware checks request bodies before controller logic runs. Invalid input returns a `400` response with a validation message.

Important validations include:

- Signup requires valid email, full name, and password length of at least 6 characters.
- Onboarding requires bio, full name, native language, learning language, location, and gender.
- Profile updates require at least one field.
- Profile image updates must start with `data:image/`.
- Call records require a valid Stream call ID, channel ID, and MongoDB participant ID.

## Run Locally

```bash
npm install
npm run dev
```

The dev command runs `nodemon src/index.js`.

## Production Notes

- Set `NODE_ENV=production` in production environments.
- Set `CLIENT_ORIGINS` to the deployed frontend URL.
- Use a strong `JWT_SECRET_KEY`.
- Configure Stream, MongoDB, Cloudinary, and Brevo in the host environment.
- Keep the backend behind HTTPS so secure cookies work correctly.

# Frontend

React + Vite client for the Uber Clone. It contains rider and driver screens, route protection, context-based session state, REST calls to the backend, and Socket.IO listeners for live ride updates.

## Setup

```bash
cd Frontend
npm install
npm run dev
```

Vite usually serves the app at `http://localhost:5173`.

## Environment Variables

Create `Frontend/.env`:

```env
VITE_BASEAPP_BACKEND_URL=http://localhost:4000
```

`VITE_BASEAPP_BACKEND_URL` must point at the backend server. In production, set it to the deployed API URL.

## Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # build production assets into dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Folder Structure

```text
Frontend/
  assets/                 Static image assets
  src/
    components/           Reusable panels and ride UI
    context/              User, driver, and socket providers
    pages/                Route-level screens
    App.jsx               React Router route table
    main.jsx              Provider setup and app bootstrap
    index.css             Tailwind entry styles
  index.html
  package.json
  tailwind.config.js
  vite.config.js
```

## Routing

Routes are declared in `src/App.jsx`.

- `/` - landing/get-started screen
- `/home` - protected rider home and booking flow
- `/user-signup` - rider signup
- `/user-login` - rider login
- `/user-riding` - rider active ride screen
- `/user-logout` - protected rider logout
- `/driver-home` - protected driver dashboard
- `/driver-signup` - driver signup
- `/driver-login` - driver login
- `/driver-riding` - protected driver in-progress ride screen
- `/driver-logout` - protected driver logout

Protected routes use:

- `UserProtectedWrapper` for rider-only screens
- `DriverProtectedWrapper` for driver-only screens

## State Management

This app uses React Context instead of a global state library.

- `UserContext.jsx` stores the current rider profile.
- `DriverContext.jsx` stores the current driver profile and persists `driverData` in local storage.
- `SocketContext.jsx` owns the Socket.IO client and exposes `sendMessage` and `recieveMessage`.

Authentication tokens are stored separately:

- `userToken` for rider API calls
- `driverToken` for driver API calls

There is also a legacy fallback to `token` in several request headers so older local sessions do not immediately break. New logins write to the role-specific keys.

## Main User Flows

Rider flow:

1. Sign up or log in.
2. Enter pickup and destination.
3. Fetch fare estimates with `/api/rides/get-fare`.
4. Select vehicle type.
5. Create a ride with `/api/rides/create-ride`.
6. Wait for a driver acceptance event over Socket.IO.
7. Share the displayed OTP with the driver.
8. Move to the active ride screen when the backend emits `otp-verified`.

Driver flow:

1. Sign up or log in.
2. Join the socket session as a driver.
3. Send location updates with `update-driver-location`.
4. Fetch nearby available rides or receive `new-ride`.
5. Accept a ride with `/api/rides/accept-ride`.
6. Enter the rider OTP using `/api/rides/verify-otp`.
7. Finish the ride with `/api/rides/finish-ride`.

## API Integration

Axios calls use `import.meta.env.VITE_BASEAPP_BACKEND_URL` as the API base URL.

Rider endpoints used by the frontend:

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `GET /api/users/logout`
- `GET /api/maps/get-suggestions`
- `GET /api/rides/get-fare`
- `POST /api/rides/create-ride`
- `GET /api/rides/get-user-rides`
- `GET /api/rides/get-ride-details/:rideId`
- `POST /api/rides/cancel-ride`

Driver/ride endpoints used by driver screens:

- Driver auth/profile/logout pages should align with the backend driver route names.
- `GET /api/rides/get-available-rides`
- `GET /api/rides/get-driver-rides`
- `POST /api/rides/accept-ride`
- `POST /api/rides/verify-otp`
- `POST /api/rides/finish-ride`

Socket.IO events used by the frontend:

- Sent: `join`, `update-driver-location`
- Received: `joined`, `new-ride`, `new-ride-notification`, `ride-accepted`, `otp-verified`, `ride-completed`, `ride-cancelled`, `ride-status`, `driver-location`

## Build

```bash
npm run build
```

The production build is written to `Frontend/dist/`.

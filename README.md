# Uber Clone

Full-stack ride-booking application inspired by Uber. The app lets riders sign up, search locations, estimate fares, request rides, receive driver acceptance updates in real time, share an OTP to start the trip, and complete the ride flow with a driver.

## Project Overview

This repository is split into two apps:

- `Frontend/` - React + Vite single-page app for riders and drivers.
- `Backend/` - Express + MongoDB API with Socket.IO for live ride updates.

The frontend talks to the backend over REST for authentication, maps, fares, ride creation, OTP verification, and ride completion. Socket.IO is used for live events such as joining as a user/driver, broadcasting nearby ride requests, notifying users when a driver accepts, and updating ride status.

## Architecture

```text
Rider / Driver browser
        |
        | React Router pages, Context state, Axios, Socket.IO client
        v
Frontend React app
        |
        | REST: /api/users, /api/drivers, /api/maps, /api/rides
        | Realtime: Socket.IO events
        v
Backend Express app
        |
        | Mongoose models and services
        v
MongoDB

External maps service: OpenRouteService for geocoding, suggestions, and route distance/time.
```

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, GSAP, Tailwind CSS, Remix Icon, Socket.IO Client
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, express-validator
- Maps: OpenRouteService geocoding and directions APIs
- Package management: npm-compatible setup with `pnpm-lock.yaml` files present

## Quick Start

Prerequisites:

- Node.js 18+
- MongoDB connection string
- OpenRouteService API key

1. Install backend dependencies:

```bash
cd Backend
npm install
```

2. Create `Backend/.env`:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ORS_MAPS_API=your_openrouteservice_api_key
```

3. Start the backend:

```bash
npm run dev
```

4. Install frontend dependencies:

```bash
cd ../Frontend
npm install
```

5. Create `Frontend/.env`:

```env
VITE_BASEAPP_BACKEND_URL=http://localhost:4000
```

6. Start the frontend:

```bash
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

For local rider + driver testing, use separate browser profiles or windows. The app stores separate auth tokens for riders and drivers as `userToken` and `driverToken`.

## Documentation

- [Frontend README](./Frontend/README.md)
- [Backend README](./Backend/README.md)

## Deployment Overview

Deploy the backend as a Node.js service with environment variables configured for MongoDB, JWT, and OpenRouteService. Deploy the frontend as a static Vite build and set `VITE_BASEAPP_BACKEND_URL` to the deployed backend URL. Make sure Socket.IO traffic is supported by the backend hosting provider.

# Frontend

The frontend is the React single-page application for rider and driver registration, ride requests, driver dispatch, and active-ride status views. It communicates with the backend through Axios REST calls and Socket.IO.

## Technology

- React 18 and React DOM
- Vite 6 and `@vitejs/plugin-react`
- React Router 6
- Axios and `socket.io-client`
- Tailwind CSS 3, PostCSS, and Autoprefixer
- GSAP and Remix Icon are installed dependencies

## Setup and Scripts

Requires Node.js 18 or newer and npm.

```powershell
cd Frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. The backend must also be running; see the [project setup](../README.md#run-locally) and [backend guide](../Backend/README.md).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint on the frontend files |

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_BASEAPP_BACKEND_URL` | No | Backend origin used by REST requests and Socket.IO; defaults to `http://localhost:4000` |

Vite exposes `VITE_` variables to browser code. Keep secrets, including the OpenRouteService API key and JWT secret, in the backend environment only.

## Routes and User Flows

| Route | Purpose |
| --- | --- |
| `/` | Entry page |
| `/signup`, `/login` | Rider registration and login |
| `/home` | Rider place search, fare/vehicle selection, and ride request |
| `/riding` | Rider's active ride, driver details, and OTP |
| `/logout` | Rider logout |
| `/driver-signup`, `/driver-login` | Driver registration and login |
| `/driver-home` | Driver availability, location sharing, and incoming requests |
| `/driver-riding` | Driver arrival, OTP verification, ride start, cancellation, and completion |
| `/driver-logout` | Driver logout |

Protected rider and driver routes call the corresponding profile endpoint before rendering. If the token is missing or rejected, the wrapper clears the token and navigates to that role's login route.

## Frontend Structure

```text
src/
  App.jsx                 Route definitions
  main.jsx                React root, providers, and BrowserRouter
  context/                User, driver, and Socket.IO contexts
  pages/                  Rider and driver screens
  components/             Map, location, vehicle, and ride-flow UI
  index.css               Tailwind directives and map styles
assets/images/            Logo and driver image assets
```

The user context keeps the current user in React state. The driver context stores driver profile data in React state and `localStorage`. User and driver bearer tokens are stored separately in `localStorage`; the active ride IDs are also stored there to reload an in-progress ride after navigation or refresh. API calls are made from pages/components with Axios; there is no separate API client or custom-hooks directory.

## REST and Socket.IO

Pages call the backend origin configured by `VITE_BASEAPP_BACKEND_URL`. Most API calls send `Authorization: Bearer <token>`. Login and registration save the returned token and account data; logout calls the backend and clears local client state.

`SocketContext` creates a Socket.IO client with reconnection enabled (up to five attempts). Authenticated rider and driver pages send `join` with the role-specific token. The driver home page sends its location and availability events and listens for `ride-request`. Rider and active-ride pages listen for ride acceptance/status/completion and driver-location updates. Ride state-changing actions in the current UI use REST endpoints; Socket.IO is used for notification and live updates.

## Location and Map

Riders choose locations from backend place suggestions; this UI does not request rider geolocation. The driver home page requests browser geolocation permission, publishes the driver's coordinates after connection and approximately every 15 seconds, and needs a valid location before becoming available. The map embeds OpenStreetMap and positions pickup, destination, and driver markers as overlays. It does not draw a route line or provide navigation. Place lookup and route distance/duration depend on the backend's OpenRouteService configuration.

## Build and Limitations

Run `npm run build` to create the static Vite output. No frontend test script is defined. The frontend has no ride-history page or payment flow. `LocationSearchPanel.jsx` and `WaitingForDriver.jsx` are present but are not used by the current routed ride flow; the active screens render location suggestions and waiting state from other components/page code.

For the overall architecture, setup variables, and known system gaps, see the [root README](../README.md).

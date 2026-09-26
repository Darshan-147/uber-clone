# Backend

The backend provides the ride-hailing REST API and Socket.IO server used by the rider and driver applications. It persists users, drivers, rides, and revoked tokens in MongoDB, and calls OpenRouteService for place lookup and driving distance/duration.

## Technology and Scripts

- Node.js with Express 4
- Socket.IO 4
- MongoDB through Mongoose 8
- JWT (`jsonwebtoken`), bcrypt, `express-validator`, CORS, cookie-parser, dotenv, and Axios

Requires Node.js 18 or newer, npm, MongoDB, and an OpenRouteService API key for maps/fare functionality.

```powershell
cd Backend
npm install
Copy-Item .env.example .env
```

Set the required values in `.env`, then start the development server:

```powershell
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start `server.js` with nodemon |
| `npm test` | Run the Node.js built-in test runner (`node --test`) |

The server defaults to port `4000`. It exposes `GET /` as a service response and `GET /health` as a database-aware health check (`200` when connected, `503` otherwise). The HTTP server and Socket.IO share the same port. The process handles `SIGINT` and `SIGTERM` for shutdown.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes for database-backed requests | Mongoose connection string. Without it the HTTP process still starts, but database-backed endpoints are unavailable. |
| `JWT_SECRET` | Yes | Signs and verifies user/driver JWTs and Socket.IO join authentication. |
| `ORS_MAPS_API` | Yes for maps and fare/ride route calculations | Server-side OpenRouteService API key. |
| `PORT` | No | Listening port; defaults to `4000`. |
| `CLIENT_ORIGIN` | No | Comma-separated allowed frontend origins; defaults to `http://localhost:5173`. Used by Express CORS and Socket.IO CORS. |
| `NODE_ENV` | No | When `production`, auth cookies use `secure: true` and `sameSite: "none"`; otherwise they use `secure: false` and `sameSite: "lax"`. |

The template is in `.env.example`. Do not commit `.env` or share real keys. The frontend has its own backend-origin setting documented in [Frontend/README.md](../Frontend/README.md).

## Architecture and Files

```text
Backend/
  app.js                 Express middleware and route registration
  server.js              HTTP server, Socket.IO initialization, startup/shutdown
  socket.js              Socket authentication, event handlers, live notifications
  routes/                User, driver, maps, and ride routes/validation
  controllers/           HTTP request/response handling
  services/              Account, maps, and ride business logic
  models/                Mongoose schemas
  database/db.js         MongoDB connection
  middlewares/           JWT auth, auth rate limit, and HTTP errors
  utils/ride.constants.js Vehicle/status constants and GeoJSON/state helpers
  test/                  Node.js built-in tests
```

Routes apply input validation and role middleware before controllers. Controllers call services for the main ride and account operations. Socket.IO shares selected ride operations through the ride service and emits updates to the rider/driver socket IDs stored on their records.

## Authentication and Middleware

- User and driver passwords are hashed with bcrypt (cost factor 10); password fields are excluded from normal Mongoose selection and JSON output.
- JWTs contain the account ID and role (`user` or `driver`) and expire after 24 hours. HTTP requests accept a bearer token or the role-specific `userToken`/`driverToken` cookie. The app client currently sends bearer tokens.
- Role-specific middleware reloads the account and prevents user/driver role interchange. `authAny` accepts either role; ride access is further scoped to the associated user or driver.
- Logout adds the active token to `blacklistTokens`, whose MongoDB TTL index expires records after 24 hours. Driver logout also sets the driver offline and clears its socket ID.
- Auth endpoints use an in-process per-IP limit of 20 attempts per 15 minutes. This limiter is not shared between server processes and its state is lost at restart.
- Express enables JSON and URL-encoded body parsing, cookie parsing, and credentialed CORS for configured origins. Auth cookies are `httpOnly`.
- `notFound` returns `404`. The central error handler returns structured errors, maps Mongoose validation errors to `400`, duplicate-key errors to `409`, and hides server-error details behind a generic `500` message. Some maps-controller failures are caught locally and returned as `404`.

Socket `join` verifies the JWT and account role, then records the socket ID. Unlike HTTP auth middleware, this Socket.IO join path does not check the token blacklist; this is a current security limitation.

## Database Models

All main models use Mongoose timestamps. The explicit MongoDB collections are `users`, `drivers`, `rides`, and the model-default collection for `blacklistTokens`.

| Model | Stored data |
| --- | --- |
| `User` | `fullname.firstname`, `fullname.lastname`, unique `email`, hidden hashed `password`, and optional `socketId` |
| `Driver` | Name/email/password/socket ID, `status` (`available`, `busy`, `offline`), vehicle color/plate/capacity/type, and GeoJSON `location` (`Point`, `[longitude, latitude]`) |
| `Ride` | Rider/optional driver references, pickup/destination text, fare, vehicle type, status, distance (meters), duration (seconds), OTP and lifecycle timestamps, cancellation actor, rejected driver IDs, and payment-related fields |
| `BlacklistToken` | Unique JWT and creation time; a TTL index removes it after 86,400 seconds |

Driver location has a 2dsphere index combined with status and vehicle type. Ride indexes support user history, driver/status history, and status/time queries. Ride statuses are `pending`, `accepted`, `arriving`, `in_progress`, `completed`, and `cancelled`. Payment fields (`paymentID`, `orderID`, and `signature`) are data fields only; there is no payment endpoint or provider integration.

## HTTP API

Unless noted otherwise, successful resource responses use a `data` object. Authenticated routes accept `Authorization: Bearer <token>`; role requirements are shown below. The frontend's default API origin is `http://localhost:4000`.

### Health

| Method and path | Auth | Behavior |
| --- | --- | --- |
| `GET /` | None | Returns `{ "data": { "service": "ride-hailing-api", "status": "ok" } }`. |
| `GET /health` | None | Returns database-connected status; `503` if disconnected. |

### User Accounts

| Method and path | Auth | Behavior |
| --- | --- | --- |
| `POST /api/users/register` | None | Creates a user and returns `201` with `{ data: { token, user } }`. Requires `fullname.firstname` (3+ chars), valid email, and password (6+ chars); the model also requires a last name. |
| `POST /api/users/login` | None | Authenticates email/password and returns `{ data: { token, user } }`. |
| `GET /api/users/profile` | User | Returns `{ data: { user } }`. |
| `POST /api/users/logout` | User | Blacklists the token and clears the `userToken` cookie. |

### Driver Accounts

| Method and path | Auth | Behavior |
| --- | --- | --- |
| `POST /api/drivers/register` | None | Creates a driver and returns `201` with `{ data: { token, driver } }`. Requires first name (3+ chars), valid email, password (6+ chars), vehicle color/plate (3+ chars), capacity (integer, at least 1), and vehicle type (`auto`, `car`, `motorcycle`). The model also requires a last name. |
| `POST /api/drivers/login` | None | Authenticates email/password and returns `{ data: { token, driver } }`. |
| `GET /api/drivers/profile` | Driver | Returns `{ data: { driver } }`. |
| `POST /api/drivers/logout` | Driver | Blacklists the token, sets the driver offline, clears its socket ID, and clears the cookie. |
| `PATCH /api/drivers/status` | Driver | Sets body `status` to `available` or `offline`. Going available requires a valid stored location; a busy driver cannot go offline. |

### Maps and Routing

All maps endpoints require a user token. Address/input strings must be at least three characters.

| Method and path | Query | Behavior |
| --- | --- | --- |
| `GET /api/maps/get-coordinates` | `address` | Geocodes an address; returns `{ lat, lng }`. |
| `GET /api/maps/get-distance-time` | `origin`, `destination` | Returns distance in meters and duration in seconds, each with a display string. Uses OpenRouteService `driving-car` directions. |
| `GET /api/maps/get-suggestions` | `input` | Returns place suggestions (`name`, `lat`, `lng`); autocomplete is restricted to India in the service request. |

These routes depend on `ORS_MAPS_API`. Validation errors return `400`; map-controller service failures are currently returned as `404`.

### Rides

| Method and path | Auth | Behavior |
| --- | --- | --- |
| `GET /api/rides/get-fare` | User | Requires `pickup` and `destination` query strings; returns fare estimates for all three vehicle types in `data.fare`. |
| `POST /api/rides/create-ride` | User | Requires `pickup`, `destination` (3+ chars) and `vehicleType`; creates a pending ride (`201`) with calculated distance, duration, and fare, then attempts to notify nearby drivers. |
| `GET /api/rides/user/history` | User | Returns the user's rides, newest first, in `data.rides`. |
| `GET /api/rides/driver/history` | Driver | Returns the driver's rides, newest first, in `data.rides`. |
| `GET /api/rides/:rideId` | User or driver | Returns a ride only to its associated rider or assigned driver. OTP is included only for the rider. |
| `GET /api/rides/:rideId/otp` | User | Returns the OTP for that user's accepted/arriving/in-progress ride. |
| `POST /api/rides/:rideId/accept` | Driver | Accepts a pending ride if the driver is available and was not recorded as rejecting it. Sets driver busy and generates an OTP. |
| `POST /api/rides/:rideId/reject` | Driver | Records the driver's rejection on a pending, unassigned ride. |
| `POST /api/rides/:rideId/arrive` | Driver | Moves an accepted ride to `arriving`. |
| `POST /api/rides/:rideId/verify-otp` | Driver | Body `{ "otp": "123456" }`; verifies the six-digit rider OTP for that ride. |
| `POST /api/rides/:rideId/start` | Driver | Moves an arriving ride to `in_progress`, only after OTP verification. |
| `POST /api/rides/:rideId/complete` | Driver | Completes an in-progress ride and returns the driver to available status. |
| `POST /api/rides/:rideId/cancel` | Associated user or driver | Cancels a ride while pending, accepted, or arriving. A driver assigned to the ride is returned to available status. |

Ride actions validate MongoDB IDs. Invalid input generally returns `400`; missing or conflicting ride state returns `404` or `409`. Fare uses the OpenRouteService distance/duration and these current rates:

| Vehicle | Base | Per km | Per minute |
| --- | ---: | ---: | ---: |
| Auto | ₹30 | ₹15 | ₹2 |
| Car | ₹50 | ₹20 | ₹3 |
| Motorcycle | ₹20 | ₹10 | ₹1 |

#### Example: Create a Ride

```bash
curl -X POST http://localhost:4000/api/rides/create-ride \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"pickup":"Ahmedabad Junction","destination":"Sabarmati Ashram","vehicleType":"car"}'
```

The successful response has the form `{ "data": { "ride": { "_id": "...", "status": "pending", "fare": 123, "otp": "..." } } }`. The OTP is returned to the rider and is not included in driver-facing ride updates.

## Ride Lifecycle and Dispatch

The permitted ride transitions are `pending` → `accepted` → `arriving` → `in_progress` → `completed`; rides can be cancelled from `pending`, `accepted`, or `arriving`. OTP verification is a required condition before `start`, even though the model records it separately from ride status.

On creation, the pickup address is geocoded and the backend searches for connected, available drivers of the selected vehicle type within 6,000 meters using MongoDB's geospatial query. It emits one `ride-request` to matching socket IDs. This notification attempt is best-effort; if maps or driver discovery fails, the ride remains pending. Rejection records the driver ID but does not trigger a new dispatch attempt. There is no persistent queue, payment settlement, or automated matching retry.

## Socket.IO Events

Socket.IO connects on the same origin/port as the HTTP API. A client must send `join` with `{ "token": "<jwt>", "userType": "user" | "driver" }`; the server verifies the token/role and associates the socket ID with that account. Event handlers may acknowledge with `{ ok, ... }`; failures also emit `socket-error` with a message.

| Direction | Event | Payload / behavior |
| --- | --- | --- |
| Client → server | `join` | Authenticates the socket and stores the account socket ID. |
| Client → server (driver) | `driver-online`, `driver-offline` | Changes availability; going online requires a valid stored location, and busy drivers cannot go offline. |
| Client → server (driver) | `update-driver-location` | `{ location: { lat, lng } }`; validates and stores a GeoJSON point. Sends `driver-location-updated` to the rider on an active ride. |
| Client → server (driver) | `accept-ride`, `reject-ride` | `{ rideId }`; invokes the same ride service operations as the REST API. |
| Client → server (driver) | `update-ride-status` | `{ rideId, status: "arriving" }`; this socket event only allows the arriving transition. |
| Server → driver | `ride-request` | `{ ride }` without the OTP, sent to eligible connected drivers after ride creation. |
| Server → rider and driver | `ride-accepted`, `ride-status-updated`, `ride-completed` | `{ ride }`; OTP is omitted from driver payloads. |
| Server → rider | `driver-location-updated` | `{ rideId, location }` for the active ride. |
| Server → client | `socket-error` | `{ message }` when a socket event fails. |

The frontend currently uses REST for accept/reject/arrival/OTP/start/complete/cancel actions; the corresponding socket actions remain available to clients.

## Errors and Validation

Most route inputs use `express-validator`. Ride/user/driver controllers convert validation issues to `400` with an `error.details` array. Authentication failures return `401`; the auth limiter returns `429`. The central error response uses `{ "error": { "message": "...", "details": [...] } }` where details are supplied. Unknown routes return `{ "error": { "message": "Route not found" } }`. Map controllers use a separate response shape on errors (`{ errors: [...] }` for validation or `{ message: "..." }` for service failures).

## Tests and Known Limits

Run `npm test` to execute `test/ride-lifecycle.test.js`. It checks fare calculations, legal state transitions, GeoJSON validation, role claims in JWTs, and six-digit OTP generation. It does not exercise HTTP routes, MongoDB persistence, external maps calls, or Socket.IO end-to-end behavior.

Other implementation limits to keep in mind:

- Socket.IO join does not consult the HTTP token blacklist.
- The authentication rate limiter is in-memory and per process.
- Nearby dispatch is one best-effort notification pass with no retry or queue.
- Map-service errors are not consistently propagated as upstream status codes; maps endpoints currently report `404` on caught failures.
- Payment-related ride fields exist, but payments are not implemented.
- No deployment configuration or license file is present at the repository root.

See the [root README](../README.md) for overall setup and project status.

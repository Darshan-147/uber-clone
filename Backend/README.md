# User Registration Endpoint

## Endpoint

`POST /api/users/register`

## Description

This endpoint is used to register a new user. It validates the input data, checks if the email already exists, hashes the password, and creates a new user in the database.

## Request Body

The request body should be a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
```

### Validation Rules

- `fullname.firstname`: Must be at least 3 characters long.
- `fullname.lastname`: Must be at least 3 characters long.
- `email`: Must be a valid email address.
- `password`: Must be at least 6 characters long.

## Responses

### Success

- **Status Code**: `201 Created`
- **Response Body**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "password": "123456",
      "socketId": null
    }
  }
  ```

### Validation Error

- **Status Code**: `400 Bad Request`
- **Response Body**:
  ```json
  {
    "errors": [
      {
        "msg": "First name must be at least 3 characters long",
        "param": "fullname.firstname",
        "location": "body"
      },
      {
        "msg": "Invalid Email",
        "param": "email",
        "location": "body"
      },
      {
        "msg": "Password must be at least 6 characters long",
        "param": "password",
        "location": "body"
      }
    ]
  }
  ```

### Email Already Exists

- **Status Code**: `400 Bad Request`
- **Response Body**:
  ```json
  {
    "message": "Email already exists"
  }
  ```

### Server Error

- **Status Code**: `500 Internal Server Error`
- **Response Body**:
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### Example Request

```bash
- curl -X POST http://localhost:4000/api/users/register \
- "Content-Type: application/json" \
```

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "$2b$10$...",
    "socketId": null
  }
}
```

# User Profile Endpoint

## Endpoint

`GET /api/users/profile`

## Description

Retrieves the profile information of the currently authenticated user.

## Authorization

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

## Responses

### Success

- **Status Code**: `200 OK`
- **Response Body**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
  ```

### Unauthorized

- **Status Code**: `401 Unauthorized`
- **Response Body**:
  ```json
  {
    "message": "Authorization token required"
  }
  ```

## Example Request

```bash
# For Profile
curl -X GET http://localhost:4000/api/users/profile \
-H "Authorization: Bearer your_jwt_token"
```

## Example Response

```json
{
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
        "firstname": "John",
        "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
}
```

# User Logout Endpoint

## Endpoint

`GET /api/users/logout`

## Description

Logs out the currently authenticated user by clearing the cookie and blacklisting the JWT token.

## Authorization

Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

## Responses

### Success

- **Status Code**: `200 OK`
- **Response Body**:
  ```json
  {
    "message": "Logged Out"
  }
  ```

### Unauthorized

- **Status Code**: `401 Unauthorized`
- **Response Body**:
  ```json
  {
    "message": "Authorization token required"
  }
  ```

## Example Request

```bash
curl -X GET http://localhost:4000/api/users/logout \
-H "Authorization: Bearer your_jwt_token"
```

## Example Response

```json
{
    "message": "Logged Out"
}
```

# Driver Registration Endpoint

## Endpoint

`POST /api/drivers/register`

## Description

This endpoint is used to register a new driver. It validates the input data and creates a new driver in the database.

## Request Body

The request body should be a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "yourpassword",
  "vehicle": {
    "color": "black",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

### Validation Rules

- `fullname.firstname`: Must be at least 3 characters long
- `email`: Must be a valid email address
- `password`: Must be at least 6 characters long
- `vehicle.color`: Must be at least 3 characters long
- `vehicle.plate`: Must be at least 3 characters long
- `vehicle.capacity`: Must be at least 1
- `vehicle.vehicleType`: Must be one of: "car", "motorcycle", "auto"

## Responses

### Success

- **Status Code**: `201 Created`
- **Response Body**:
  ```json
  {
    "driver": {
      "_id": "driver_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "vehicle": {
        "color": "black",
        "plate": "ABC123",
        "capacity": 4,
        "vehicleType": "car"
      }
    }
  }
  ```

### Validation Error

- **Status Code**: `400 Bad Request`
- **Response Body**:
  ```json
  {
    "errors": [
      {
        "msg": "First name must be at least 3 characters long",
        "param": "fullname.firstname",
        "location": "body"
      }
    ]
  }
  ```

## Example Request

```bash
curl -X POST http://localhost:4000/api/drivers/register \
-H "Content-Type: application/json" \
-d '{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123",
  "vehicle": {
    "color": "black",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}'
```

## Example Response

```json
  {
    "driver": {
      "_id": "driver_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "vehicle": {
        "color": "black",
        "plate": "ABC123",
        "capacity": 4,
        "vehicleType": "car"
      }
    }
  }
  ```

  # Driver Profile Endpoint

  ## Endpoint

  `GET /api/drivers/profile`

  ## Description

  Retrieves the profile information of the currently authenticated driver.

  ## Authorization

  Requires a valid JWT token in the Authorization header:
  `Authorization: Bearer <token>`

  ## Responses

  ### Success

  - **Status Code**: `200 OK`
  - **Response Body**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109ca",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "vehicle": {
        "color": "black", 
        "plate": "ABC123",
        "capacity": 4,
        "vehicleType": "car"
      },
      "socketId": null
    }
    ```

  ### Unauthorized

  - **Status Code**: `401 Unauthorized`
  - **Response Body**:
    ```json
    {
      "message": "Authorization token required"
    }
    ```

  ## Example Request
  ```bash
  
  curl -X GET http://localhost:4000/api/drivers/profile \
  -H "Authorization: Bearer your_jwt_token"
  ```

  ## Example Response

  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "vehicle": {
      "color": "black",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "socketId": null
  }
  ```

  # Driver Logout Endpoint

  ## Endpoint

  `GET /api/drivers/logout`

  ## Description

  Logs out the currently authenticated driver by clearing the authentication cookie and blacklisting the JWT token to prevent reuse.

  ## Authorization

  Requires a valid JWT token either in:
  - Cookie: `token=<jwt_token>`
  - Authorization header: `Authorization: Bearer <jwt_token>`

  ## Responses

  ### Success

  - **Status Code**: `200 OK`
  - **Response Body**:
    ```json
    {
      "message": "Logged Out Successfully"
    }
    ```

  ### Unauthorized

  - **Status Code**: `401 Unauthorized`
  - **Response Body**:
    ```json
    {
      "message": "Authorization token required" 
    }
    ```

  ## Example Request

  ```bash
  curl -X GET http://localhost:4000/api/drivers/logout \
  -H "Authorization: Bearer your_jwt_token"
  ```

  ## Example Response

  ```json
  {
    "message": "Logged Out Successfully"
  }
  ```
# ShiftSync

ShiftSync is a REST API for recording and sharing industrial shift handover information. It provides JWT-based authentication, bcrypt password hashing, MongoDB persistence, and owner-protected form updates and deletion.

This repository currently contains the backend service only. A frontend client can consume the API from any web, mobile, or desktop application.

## Features

- User registration and login
- Password hashing with `bcryptjs`
- JWT access tokens valid for 24 hours
- Operator and supervisor user roles in the data model
- Create, read, update, and delete shift handover forms
- Owner-only form updates and deletion
- Authenticated access to form data
- CORS and JSON request middleware

## Tech Stack

- **Runtime:** Node.js
- **Language:** JavaScript (CommonJS)
- **Framework:** Express 4
- **Database:** MongoDB
- **ODM:** Mongoose 7
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password security:** `bcryptjs`
- **Development server:** Nodemon

## Prerequisites

Install the following before starting:

- Node.js 18 or newer; Node.js 22 has been verified locally
- npm
- MongoDB Community Server locally, MongoDB Atlas, or another MongoDB-compatible service

Check Node.js and npm with `node --version` and `npm --version`.

## Getting Started

### 1. Install dependencies

From the project root:

`npm install`

### 2. Configure environment variables

Create a `.env` file in the project root. The file is intentionally ignored by Git because it contains secrets.

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | No | HTTP port; defaults to `8080` | `8080` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/shiftsync` |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs | A long random value |

The repository includes `.env.sample` as a template. Replace the placeholder JWT secret before using the application outside local development.

### 3. Start MongoDB

For a local MongoDB installation, make sure the MongoDB service is running and listening on port `27017`.

Alternatively, create a MongoDB Atlas database and put its connection string in `MONGO_URI`.

### 4. Start the API

Production-style start:

`npm start`

Development start with automatic restart:

`npm run dev`

The API is available at `http://localhost:8080` unless `PORT` is changed.

## API Overview

### Health endpoint

`GET /`

Returns a welcome message and confirms that the Express server is responding.

### Authentication

#### Register

`POST /api/auth/register`

Request body:

```json
{
	"username": "operator1",
	"password": "change-me",
	"role": "operator"
}
```

`role` accepts `operator` or `supervisor`. If omitted, the model defaults to `operator`.

#### Login

`POST /api/auth/login`

Request body:

```json
{
	"username": "operator1",
	"password": "change-me"
}
```

Successful login returns the user identity, role, and an `accessToken`.

### Forms

All form endpoints require an access token. The API accepts either header format:

- `Authorization: Bearer <accessToken>`
- `x-access-token: <accessToken>`

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/forms` | List all forms | Any authenticated user |
| `GET` | `/api/forms/:id` | Get one form | Any authenticated user |
| `POST` | `/api/forms` | Create a form | Any authenticated user |
| `PUT` | `/api/forms/:id` | Update a form | Form owner only |
| `DELETE` | `/api/forms/:id` | Delete a form | Form owner only |

Create-form request body:

```json
{
	"title": "Crusher plant handover",
	"content": "Inspection completed. Monitor bearing temperature.",
	"shiftDate": "2026-10-01T06:00:00.000Z"
}
```

The `content` field is currently stored as a string. It can contain plain text or a JSON-stringified object.

## Architecture

The request flow is:

`HTTP request → Express middleware → route → controller → Mongoose model → MongoDB`

### Directory structure

```text
.
├── controllers/
│   ├── auth.controllers.js   # Registration and login logic
│   └── form.controller.js    # Form CRUD logic
├── middleware/
│   └── auth.middleware.js    # JWT verification and ownership checks
├── models/
│   ├── user.model.js         # User schema
│   └── form.model.js         # Shift handover form schema
├── routes/
│   ├── auth.routes.js        # /api/auth endpoints
│   └── form.routes.js        # /api/forms endpoints
├── .env.sample
├── package.json
├── server.js                 # Express app and MongoDB connection
└── README.md
```

### Server startup

`server.js` loads environment variables, configures CORS and JSON parsing, connects to MongoDB, registers the route modules, and listens on the configured port.

### Authentication flow

1. A user registers with a username, password, and optional role.
2. The password is hashed before it is saved.
3. The user logs in with the original password.
4. The server compares the password against the stored hash.
5. The server signs a JWT containing the user ID.
6. Protected requests send the JWT in an authorization header.
7. `verifyToken` validates the token and stores the user ID on `req.userId`.

### Ownership flow

For update and delete requests, `isOwner` loads the form and compares its `createdBy` value with the authenticated user's ID. Requests from other users are rejected with HTTP 403.

## Data Models

### User

- `username`: required, unique, trimmed string
- `password`: required bcrypt hash
- `role`: `operator` or `supervisor`, default `operator`
- `createdAt` and `updatedAt`: automatic timestamps

### Form

- `title`: required, trimmed string
- `content`: required string
- `shiftDate`: required date
- `createdBy`: required reference to a `User`
- `createdAt` and `updatedAt`: automatic timestamps

## Verification

The project currently has no automated test suite. The following checks are useful after setup:

- `node --check server.js`
- `node --check controllers/auth.controllers.js`
- `node --check controllers/form.controller.js`
- `node -e "require('./routes/auth.routes'); require('./routes/form.routes'); console.log('Routes loaded')"`
- `GET http://localhost:8080/`

With MongoDB running, test the complete flow in this order:

1. Register a user.
2. Log in and save the returned access token.
3. Create a form using the token.
4. List and retrieve forms.
5. Update and delete the owned form.
6. Confirm that another user's token cannot update or delete it.

## Troubleshooting

### `ECONNREFUSED 127.0.0.1:27017`

MongoDB is not running locally, or `MONGO_URI` points to the wrong host or port. Start MongoDB or use a valid MongoDB Atlas connection string.

### `No token provided!`

The request is missing `Authorization: Bearer <token>` or `x-access-token: <token>`.

### `Unauthorized! Invalid Token.`

The token is expired, malformed, or was signed with a different `JWT_SECRET`.

### Port already in use

Set another port in `.env`, for example `PORT=8081`, then restart the server.

## Current Limitations

- No frontend application is included.
- No automated tests or API collection is included yet.
- Role values are stored, but route authorization currently relies on authentication and form ownership rather than role-specific permissions.
- Request validation and pagination are minimal.
- No production deployment configuration is included.

## Security Notes

- Never commit `.env` or real credentials.
- Use a long, random `JWT_SECRET`.
- Use HTTPS when deploying publicly.
- Review dependency audit findings before production deployment.
- Add rate limiting, stronger input validation, and role-based authorization before exposing the API to untrusted users.

## License

The package metadata currently declares the ISC license. Confirm that this matches the intended project licensing before publishing commercially.

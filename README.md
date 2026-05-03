# Task Manager API

Backend API for a task management application built with `Node.js`, `Express`, `MongoDB`, `Mongoose`, `JWT`, and `Swagger`.

## Prerequisites

Before running this project, make sure you have:

- Node.js >= 18
- npm
- MongoDB Atlas account or local MongoDB
- Git

## Current Features

### Authentication

- User registration
- Login with email and password
- JWT authentication
- Get the current authenticated user
- Update profile
- Change password

### Task Management

- User-specific task CRUD
- Create task
- Get all tasks
- Get task by id
- Update task
- Delete task

### Advanced Features

- Task filter
- Search by title
- Sorting
- Pagination

### Documentation

- Swagger UI for API testing

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas / MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- swagger-ui-express
- swagger-jsdoc

## Project Structure

```text
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
├── .gitignore
└── README.md
```

## Installation

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file inside `backend/` based on `backend/.env.example`.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Run the Project

Inside the `backend/` directory:

```bash
node server.js
```

Or:

```bash
npm start
```

The server runs by default at:

```text
http://localhost:3000
```

## Swagger API Docs

After starting the server, open:

```text
http://localhost:3000/api-docs
```

Swagger is used to:

- view API documentation
- test the API directly in the browser
- authorize requests with a JWT token

## Basic Auth Flow

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. Copy the returned token
4. Click `Authorize` in Swagger
5. Paste:

```text
Bearer <your_token>
```

6. Test protected routes such as:

- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `PUT /api/auth/change-password`
- `/api/tasks`

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `PUT /api/auth/change-password`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Supported Query Parameters for Task List

`GET /api/tasks` supports the following query parameters:

- `status`: filter tasks by status. Allowed values: `pending`, `in-progress`, `completed`
- `priority`: filter tasks by priority. Allowed values: `low`, `medium`, `high`
- `search`: search tasks by title. Example: `search=swagger`
- `sort`: sort tasks by field. Example: `sort=createdAt` or `sort=-createdAt`
- `page`: current page number. Example: `page=1`
- `limit`: number of tasks per page. Example: `limit=10`

Example:

```text
/api/tasks?status=pending&priority=high&search=swagger&sort=-createdAt&page=1&limit=10
```

---

## Basic Response Pattern

The API currently returns responses in this format:

```json
{
  "message": "Success message",
  "data": {}
}
```

Task list endpoints also include:

```json
{
  "message": "Tasks fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## Error Handling and Status Codes

The API uses standard HTTP status codes:

### Success

- `200 OK`: Request completed successfully
- `201 Created`: Resource created successfully

### Client Errors

- `400 Bad Request`: Invalid input data or invalid request fields
- `401 Unauthorized`: Missing token, invalid token, or incorrect credentials
- `404 Not Found`: Resource not found

### Server Errors

- `500 Internal Server Error`: Unexpected server error

Example error response:

```json
{
  "message": "Invalid update fields"
}
```

---

## Current Status

The project has completed the core backend phase:

- Authentication system
- Account management
- User-specific task CRUD
- Swagger testing
- MongoDB persistence

## Author

Nguyen Quang Vinh

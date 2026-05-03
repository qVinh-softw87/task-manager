const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Manager API",
            version: "1.0.0",
            description: "API documentation for the Task Manager backend.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Vinh" },
                        email: { type: "string", example: "vinh@example.com" },
                        password: { type: "string", example: "123456" },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "vinh@example.com" },
                        password: { type: "string", example: "123456" },
                    },
                },
                UpdateProfileRequest: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Vinh Updated" },
                        email: { type: "string", example: "vinh.updated@example.com" },
                    },
                },
                ChangePasswordRequest: {
                    type: "object",
                    required: ["currentPassword", "newPassword"],
                    properties: {
                        currentPassword: { type: "string", example: "123456" },
                        newPassword: { type: "string", example: "654321" },
                    },
                },
                TaskRequest: {
                    type: "object",
                    required: ["title"],
                    properties: {
                        title: { type: "string", example: "Learn Swagger" },
                        description: { type: "string", example: "Test API with Swagger UI" },
                        priority: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                            example: "high",
                        },
                        dueDate: {
                            type: "string",
                            format: "date-time",
                            example: "2026-05-01T00:00:00.000Z",
                        },
                        status: {
                            type: "string",
                            enum: ["pending", "in-progress", "completed"],
                            example: "pending",
                        },
                    },
                },
            },
        },
        paths: {
            "/api/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Register a new user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RegisterRequest" },
                            },
                        },
                    },
                    responses: {
                        201: { description: "User registered successfully" },
                        400: { description: "Invalid input or email already exists" },
                    },
                },
            },
            "/api/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Login and receive JWT token",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginRequest" },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Login successful" },
                        401: { description: "Invalid email or password" },
                    },
                },
            },
            "/api/auth/me": {
                get: {
                    tags: ["Auth"],
                    summary: "Get current authenticated user",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Current user fetched successfully" },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/api/auth/profile": {
                patch: {
                    tags: ["Auth"],
                    summary: "Update current authenticated user's profile",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Profile updated successfully" },
                        400: { description: "Invalid update fields or invalid input" },
                        401: { description: "Unauthorized" },
                        404: { description: "User not found" },
                    },
                },
            },
            "/api/auth/change-password": {
                put: {
                    tags: ["Auth"],
                    summary: "Change current authenticated user's password",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Password updated successfully" },
                        400: { description: "Invalid password input" },
                        401: { description: "Current password is incorrect or unauthorized" },
                        404: { description: "User not found" },
                    },
                },
            },
            "/api/tasks": {
                get: {
                    tags: ["Tasks"],
                    summary: "Get all tasks for the authenticated user",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Tasks fetched successfully" },
                        401: { description: "Unauthorized" },
                    },
                },
                post: {
                    tags: ["Tasks"],
                    summary: "Create a task for the authenticated user",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/TaskRequest" },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Task created successfully" },
                        400: { description: "Invalid input" },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/api/tasks/{id}": {
                get: {
                    tags: ["Tasks"],
                    summary: "Get a task by ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Task fetched successfully" },
                        404: { description: "Task not found" },
                    },
                },
                put: {
                    tags: ["Tasks"],
                    summary: "Update a task by ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/TaskRequest" },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Task updated successfully" },
                        404: { description: "Task not found" },
                    },
                },
                delete: {
                    tags: ["Tasks"],
                    summary: "Delete a task by ID",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Task deleted successfully" },
                        404: { description: "Task not found" },
                    },
                },
            },
        },
    },
    apis: [],
};

module.exports = swaggerJSDoc(options);

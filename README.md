# Task Management System

Full-stack MVC web application for managing users, projects, and tasks with server-rendered EJS views, MongoDB persistence, JWT authentication, and role-based authorization.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- EJS + `express-ejs-layouts`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcryptjs`

## MVC Structure

- `models/`: Mongoose schemas for `User`, `Project`, and `Task`
- `views/`: EJS pages for authentication and CRUD dashboards
- `controllers/`: Request handling and business logic
- `routes/`: Route definitions and protection rules
- `middleware/`: Authentication and authorization helpers

## Domain Model

This project uses a task management domain:

- `User`: system accounts with `admin` and `user` roles
- `Project`: collaborative projects with many members
- `Task`: work items assigned to one user and linked to one project

### Relationships

- One-to-many:
  One `Project` can have many `Task` records.
- Many-to-many:
  Many `User` records can belong to many `Project` records through `Project.members`.

## Features

- Registration, login, and logout
- JWT cookie-based session handling
- Password hashing with bcrypt
- Role-based authorization
- Full CRUD for users, projects, and tasks
- Relationship management in project and task forms
- Defensive cleanup for related records when users or projects are deleted
- Render deployment configuration
- GitHub Actions CI/CD pipeline for test + redeploy flow

## Local Setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`
3. Set `MONGODB_URI` and `JWT_SECRET`
4. Start the app:
   `npm start`

The app runs on `http://localhost:3000` by default.

## Environment Variables

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

## Testing

Run:

```bash
npm test
```

The automated checks validate the MVC structure, routes, schema relationships, middleware behavior, and deployment artifacts used by the CI pipeline.

## Deployment

### MongoDB Atlas

- Create an Atlas cluster
- Create a database user
- Replace `MONGODB_URI` with the Atlas connection string

### Render

- Create a new Web Service connected to the GitHub repository
- Set environment variables on Render:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `NODE_ENV=production`
- Render can also read `render.yaml` from this repository

## CI/CD

GitHub Actions runs on pushes and pull requests to `main`:

1. Checkout repository
2. Install dependencies with `npm ci`
3. Run `npm test`
4. Trigger a Render redeploy on push to `main`

To enable automatic deployment from GitHub Actions, add this repository secret:

- `RENDER_DEPLOY_HOOK_URL`

Use the deploy hook URL from your Render service settings.

## Submission Notes

Fill in `submission-info.txt` with:
- team member names and IDs
- public GitHub repository URL
- live Render deployment URL
- MongoDB Atlas connection string URI

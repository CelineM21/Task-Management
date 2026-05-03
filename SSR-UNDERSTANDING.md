# Chapter 4 Proof: Server-Side Rendering

This project is built to demonstrate the main ideas from **Chapter 04 - Server-Side Rendering** using Express, EJS, MongoDB, and MVC.

## 1. Server-Side Rendering (SSR)

The application uses **dynamic SSR**:

- Express receives the HTTP request.
- Controllers fetch data from MongoDB using Mongoose.
- The server renders a full HTML page with EJS.
- The browser receives ready-to-display HTML instead of a blank shell that must be built in the client.

Examples:

- [app.js](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/app.js:24>) sets EJS as the view engine and routes requests to controllers.
- [controllers/taskController.js](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/controllers/taskController.js:8>) fetches database data and renders `tasks/list`.
- [controllers/projectController.js](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/controllers/projectController.js:5>) fetches projects and renders `projects/list`.

## 2. Template Engine Usage

The project uses **EJS** exactly as discussed in the chapter:

- `<%= %>` for escaped output
- `<%- %>` for unescaped include/layout output
- `<% %>` for loops and conditionals

Examples:

- Escaped dynamic values:
  [views/tasks/details.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/tasks/details.ejs:4>)
- Scriptlet loops:
  [views/tasks/list.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/tasks/list.ejs:12>)
- Scriptlet conditionals:
  [views/index.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/index.ejs:4>)
- Unescaped layout/partial rendering:
  [views/layouts/main.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/layouts/main.ejs:10>)

## 3. EJS Loops and Conditionals

The chapter highlights loops and conditionals inside templates, and this project uses both in real pages:

- `forEach()` loops render task, project, and user records.
- `if/else` blocks render login/register links, role-based navigation, and error messages.

Examples:

- [views/projects/list.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/projects/list.ejs:10>)
- [views/users/list.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/users/list.ejs:1>)
- [views/auth/register.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/auth/register.ejs:7>)

## 4. Reusable Layouts and Partials

Chapter 4 discusses reusable components with EJS partials. This project demonstrates that with:

- shared layout shell:
  [views/layouts/main.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/layouts/main.ejs:1>)
- reusable navbar partial:
  [views/partials/navbar.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/partials/navbar.ejs:1>)
- reusable footer partial:
  [views/partials/footer.ejs](</c:/Users/Hp/Desktop/CSC456 Advanced Web Programming/Project 3/views/partials/footer.ejs:1>)

This improves maintainability and directly reflects the chapter section on reusable EJS components.

## 5. Multiple Routes and Templates

The chapter explains that different routes can render different templates with different data. This project does that throughout the dashboard:

- `/auth/register` -> `auth/register.ejs`
- `/auth/login` -> `auth/login.ejs`
- `/tasks` -> `tasks/list.ejs`
- `/projects` -> `projects/list.ejs`
- `/users` -> `users/list.ejs`

The rendering decisions are handled in controllers, not inside the templates.

## 6. MVC Architecture

The project matches the MVC structure from the chapter:

- **Models**:
  `models/User.js`, `models/Task.js`, `models/Project.js`
- **Views**:
  EJS files in `views/`
- **Controllers**:
  `controllers/authController.js`, `controllers/taskController.js`, `controllers/projectController.js`, `controllers/userController.js`
- **Routes**:
  `routes/`

This separation proves understanding of how SSR applications stay organized as they grow.

## 7. SSR vs CSR Understanding

This app is **not a CSR SPA**:

- It does not fetch dashboard data from a frontend framework after the page loads.
- It does not build the interface in the browser with React, Vue, or Angular.
- Instead, each request returns HTML already rendered on the server.

That matches the chapter distinction between SSR and CSR.

## 8. Oral Evaluation Talking Points

Use this short explanation in the demo:

1. The browser sends a request to an Express route.
2. The controller queries MongoDB through a Mongoose model.
3. The controller passes that data to an EJS view using `res.render(...)`.
4. EJS generates complete HTML on the server.
5. The browser receives a ready page, which is why this project demonstrates server-side rendering rather than client-side rendering.

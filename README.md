# Personal Budget Management System

A full-stack personal finance application built with Spring Boot and React.

## Features

- User authentication and role-based access
- Transaction tracking with category validation
- Monthly budgets and utilization monitoring
- Savings goals and progress tracking
- Dashboard with totals, trends, and category insights
- AI budgeting assistant with graceful fallback when no API key is configured
- Reporting and admin views

## Tech stack

- Backend: Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA
- Frontend: React + Vite, Axios, Chart.js, React Router
- Database: MySQL (production) / H2 (local development and tests)

## Local setup (without Docker)

Install Java 21 (JDK), Maven 3.9 or newer, and Node.js 20.19+ (or 22.12+).
The local backend profile uses an H2 database stored in
`%USERPROFILE%\.budget-management\budget_management.mv.db`, so Docker and a
separately installed MySQL server are not required. Your data stays on disk
when the backend stops.

1. Start the app using `start-project.cmd` in the project folder. This opens
   separate PowerShell windows for the backend and frontend, so they can keep
   running after you close VS Code. The launcher also works when PowerShell's
   script execution policy blocks `.ps1` files.
2. Open the frontend at http://localhost:5173. `localhost` without `:5173`
   does not point to the Vite development server.

To start the services manually instead:

1. Start the backend from a terminal:
   ```powershell
   Set-Location "C:\budget management\backend"
   mvn "-Dspring-boot.run.profiles=local" spring-boot:run
   ```
2. Start the frontend from a second terminal:
   ```powershell
   Set-Location "C:\budget management\frontend"
   npm.cmd install
   npm.cmd run dev
   ```
   The backend API is available at http://localhost:8080.

Keep the backend and frontend PowerShell windows open while using the app.
Closing VS Code is fine; closing those windows stops the servers, and Chrome
will then show `ERR_CONNECTION_REFUSED` until you run `start-project.cmd` again.

For a persistent database, configure the MySQL connection using the
`DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables before
starting the backend without the `local` profile.

## Free public demo deployment

The repository includes a Render Blueprint for the frontend and API. It uses
Render's free web/static hosting and a free Neon PostgreSQL database. Create a
free Neon account and database, then push this repository to GitHub and create
a Blueprint in Render using `render.yaml`. When Render asks for environment
variables, enter the Neon credentials:

- `DB_URL`: `jdbc:postgresql://<Neon-host>/<database>?sslmode=require`
- `DB_USERNAME`: the Neon database user
- `DB_PASSWORD`: the Neon database password

Do not put database credentials in GitHub or commit them to this repository.
If Render assigns different public URLs than the defaults in `render.yaml`,
update `FRONTEND_URL` on the API service and `VITE_API_URL` on the frontend
service to match the URLs shown in Render, then redeploy both services.

This setup is for a free demo, not production: Render can pause the API after
idle time, so its first request may take about a minute to wake it. Free
services have usage limits, and Neon free databases also have storage and
compute limits. GitHub hosts the source code; the Render frontend URL is the
live app link to share.

## Default admin/user notes

- Create a user from the frontend register flow.
- Admin access is available to users with the admin role in the database.
- The JWT secret and database credentials should be set from environment variables in production.

## Project structure

- `backend/` — Java Spring Boot REST API
- `frontend/` — React + Vite application

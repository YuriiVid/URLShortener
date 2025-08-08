# UrlShortener

UrlShortener is a modern web application that provides URL shortening services. Users can create short URLs that redirect to long URLs, track usage statistics, and manage their shortened links. The backend is built using ASP.NET Core Web API providing RESTful endpoints for URL management, user authentication, and analytics. The frontend is a single-page application built with React and TypeScript, offering a clean, responsive interface for creating, managing, and analyzing short URLs.

This project demonstrates full-stack development with modern tools, containerization, and best practices in web app security and deployment.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need the following installed on your system before running TaskFlow:

- .NET SDK (9.0 or newer) – to build and run the ASP.NET Core backend
- Node.js (23.11 or LTS) – to build the React frontend
- npm – package manager for the frontend dependencies
- (Optional) Docker & Docker Compose – for running the app in containers with one command
- PostgreSQL (17.2) – used by the ASP.NET Core API to store tasks (configuration in appsettings.json).

### Installing

#### 1. Clone the repository:

```bash
git clone https://github.com/YuriiVid/UrlShortener.git
cd UrlShortener
```

#### 2. Copy the example environment files and edit them with your own values:

```bash
cp API/.config/api_example.env .env     # For ASP.NET Core backend
cp API/.config/db_example.env db.env    # For PostgreSQL
cp frontend/example.env frontend/.env   # For React frontend
```

Edit these files to match your local or production setup. See [Environment Configuration](#environment-configuration) for details.

#### 3. Run with Docker Compose (all-in-one):

```bash
docker compose up -d
```

This spins up the PostgreSQL database, API, and React frontend using the configured environment variables.

#### 4. Or run without Docker:

Start the database, then

Backend (ASP.NET Core API):

```bash
dotnet restore
dotnet run
```

Frontend (React):

```bash
cd frontend
npm install
npm run dev
```

Open the app:

- Frontend: http://localhost:3000
- API: http://localhost:5196 (or configured in .env)

## Running the tests
Run all unit tests via CLI:

```bash
dotnet test
```
This command:

Builds the solution.

Runs all test methods marked with [Fact] or [Theory].

Outputs a summary with passed/failed counts.

If you use Visual Studio or VS Code, you can also run tests via the Test Explorer UI.

## Environment Configuration

To run this project, you will need to add the following environment variables to your .env file

| **File**        | **Variable**                                          | **Description**                  | **Example**              |
| --------------- | ----------------------------------------------------- | -------------------------------- | ------------------------ |
| `.env` (API)    | `ASPNETCORE_ENVIRONMENT`                              | ASP.NET environment              | `Development`            |
|                 | `ASPNETCORE_HTTPS_PORTS`                              | HTTP port                       | `5196`                   |
| `db.env`        | `POSTGRES_USER`                                       | Database username                | `user`               |
|                 | `POSTGRES_PASSWORD`                                   | Database password                | `password`            |
|                 | `POSTGRES_DB`                                         | Name of the database             | `url_shortener`             |
| `frontend/.env` | `NODE_ENV`                                            | Frontend environment             | `development`            |
|                 | `VITE_API_URL`                                        | Backend API base URL             | `https://localhost:5196/api` |

Also you need to change database connection string and JWT key in corresponding appsettings.json. If u are using Docker set ASPNETCORE_ENVIRONMENT to "Docker" and change appsettings.Docker.json. Other changes in configuration are up to you.

## Built With

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) – The web framework used for the backend API
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core) – ORM for database access (used with PostgreSQL)
- [React](https://react.dev) – JavaScript library for building the frontend user interface
- [TypeScript](https://www.typescriptlang.org) – Typed superset of JavaScript, used in the React frontend
- [Vite](https://vite.dev) –Lightning-fast frontend build tool for React
- [npm](https://www.npmjs.com) – Package manager for the frontend dependencies.
- [Docker](https://www.docker.com) – Container platform used for development and deployment (via Docker Compose)

## Authors

- **Yurii Vidoniak** - _Initial work_ - [YuriiVid](https://github.com/YuriiVid)


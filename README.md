# Sound Hub

Sound Hub is a community music-discovery app for independent artists and listeners. The frontend is React; the backend is a Go HTTP API backed by PostgreSQL. Uploaded audio and profile images are stored on disk, with ownership and track/event metadata in Postgres.

## What changed

- Replaced the Node/MongoDB/GridFS backend with a Go service and PostgreSQL schema.
- Removed Multer. Go's standard-library multipart parser handles uploads with a 10 MB request limit and generated filenames.
- Kept the existing API paths and wired the React client to the Go service.
- Added database-backed artist search, events, community chat, and feedback.
- Refreshed the current pages around the existing dark/purple Sound Hub identity.
- Existing files in `backend/public/uploads` are left untouched. Because this setup starts with a fresh database, MongoDB records are not imported; those old files are still served as static uploads but are not automatically listed as tracks.

## Requirements

- Go 1.23 or newer
- PostgreSQL 14 or newer
- Node.js 18 or newer

## Run locally (Windows PowerShell)

Create a PostgreSQL database named `soundhub`, then open a PowerShell terminal in the repository root and start the API:

```powershell
$env:DATABASE_URL = "postgres://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/soundhub?sslmode=disable"
$env:JWT_SECRET = "replace-this-with-a-random-secret-at-least-32-characters-long"
Set-Location backend
go run .
```

The Go service applies `backend/migrations/001_initial.sql` at startup and listens on port `3000`. Start the frontend in a second terminal **after** the API so Create React App can select port `3001`:

```powershell
Set-Location frontend
npm install
$env:PORT = "3001"
$env:REACT_APP_API_URL = "http://localhost:3000"
npm start
```

Open `http://localhost:3001`. The backend accepts browser requests from `http://localhost:3001` by default; configure `FRONTEND_ORIGIN` to match a different frontend origin.

## Tests and production build

```powershell
Set-Location backend
go test ./...
```

```powershell
Set-Location frontend
npm test -- --watchAll=false
npm run build
```

## API overview

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET/PUT /user/profile`, `GET /user/tracks`
- `GET /user/search`, `GET /search`
- `POST /upload`, `GET /files/{id}`, `DELETE /files/{id}`
- `GET /tracks/recent-tracks`, `GET /tracks/featured`, `PUT /tracks/feature/{id}`
- `GET/POST /events`, `GET/PUT/DELETE /events/{id}`
- `GET/POST /chat/messages`, `POST /feedback`
- `GET /health`

Protected API calls use `Authorization: Bearer <token>`. Set `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), `ADDR`, `FRONTEND_ORIGIN`, and optionally `UPLOAD_DIR` through the process environment. The app does not load `.env` files.

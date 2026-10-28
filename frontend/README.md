# Sound Hub frontend

The React app is powered by Create React App. See the [project README](../README.md) for the full-stack setup, including PostgreSQL and Go API configuration.

From this directory:

```powershell
npm install
$env:PORT = "3001"
$env:REACT_APP_API_URL = "http://localhost:3000"
npm start
```

Run `npm test -- --watchAll=false` for tests or `npm run build` for a production build.

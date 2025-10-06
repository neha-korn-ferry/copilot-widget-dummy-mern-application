# Participant Insights UI

A React + TypeScript frontend that pairs with the Express API in the project root to demonstrate both cookie- and token-based authentication flows.

## Available Scripts

Inside the `frontend` directory you can run:

- `npm start` – Launches `react-scripts` dev server at `http://localhost:3000`.
- `npm test` – Runs the CRA test harness.
- `npm run build` – Generates production assets under `build/`.

## Environment Variables

Create an optional `.env` file here to point the UI to a different API base:

```
REACT_APP_API_BASE_URL=http://localhost:4000
```

In production (e.g., Render static site), set this variable to the deployed API URL.

## How it Works

- Provides a sign-in form that supports two auth modes: session cookie or bearer token.
- Persists issued tokens in `localStorage` to restore state after a refresh while respecting cookie sessions automatically.
- Calls the protected `/participant-summary` endpoint to display mock participant analytics.

Refer to the root `README.md` for backend setup and deployment details.

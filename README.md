# CineOrbit

CineOrbit is a React + Redux movie discovery app powered by the TMDB API.

## Tech Stack

- React 17
- Redux Toolkit + RTK Query
- Material UI (MUI v5)
- Axios
- Docker + Nginx (optional; app on port **8080**)

## Prerequisites

- Node.js 18+
- npm 9+
- TMDB API key

## Environment Variables

Copy `.env.example` to `.env` and fill values:

- `REACT_APP_TMDB_KEY`: TMDB API key
- `REACT_APP_TMDB_REDIRECT_URL`: OAuth callback URL (`/approved`)

Example:

```env
REACT_APP_TMDB_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_REDIRECT_URL=http://localhost:3000/approved
```

## Local Development

```bash
npm install
npm run start
```

App runs at `http://localhost:3000`.

## Docker

1. Copy `.env.example` to `.env`. Set `REACT_APP_TMDB_KEY`. For this container use:

   `REACT_APP_TMDB_REDIRECT_URL=http://localhost:8080/approved` (must match your TMDB app callback URLs).

2. From the project root:

```bash
docker compose up -d --build
```

Open **http://localhost:8080** (port **8080** avoids clashing with another app on 3000).

After UI or `.env` changes:

```bash
npm run docker:refresh
```

Stop: `npm run docker:down`.

## Quality Commands

```bash
npm run lint
npm run lint:fix
npm run i18n:check
npm run test:ci
npm run build
```

## Project Structure

`src/app` - Redux store setup  
`src/features` - Redux slices  
`src/services` - RTK Query API layer  
`src/utils` - shared utilities and API helpers  
`src/components` - pages and UI components

## Routes

- `/` — Landing home (hero, trending, popular previews)
- `/browse` — Full browse grid (categories, genres, search results)
- `/movie/:id`, `/tv/:id`, `/actors/:id`, `/profile/:id`, `/approved` — as before

## Internationalization (i18n)

- UI strings are in `src/locales/en.json` and `src/locales/tr.json`.
- Toggle **EN / TR** in the app bar (next to the theme button). Choice is stored in `localStorage` under `cineorbit_language`.
- Default language follows the browser; fallback is English.
- Voice assistant uses **en-US** or **tr-TR** speech recognition based on the active language.

## Security Notes

- Never commit real secrets in `.env`.
- Rotate TMDB API keys if exposed.
- Keep authentication/session data minimal in browser storage.

## Deployment

Production bundle:

```bash
npm run build
```

Serve the `build` directory with Nginx or any static server.
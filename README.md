# URL Frontend

Frontend for monitoring website URLs and showing their latest uptime status.

## Features

- Add a website URL to monitor
- Fetch latest ping results from the backend
- Auto-refresh checks every 60 seconds
- Show total, up, and down counts
- Open captured error snapshots for failed checks

## Tech Stack

- React
- Vite
- Tailwind CSS

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

## API Endpoints Used

This frontend expects these backend routes:

- `GET /api/url-pings/`
- `POST /api/url-create/`
- `GET /api/url-ping/:id/error/`

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run preview` previews the production build
- `npm run lint` runs ESLint

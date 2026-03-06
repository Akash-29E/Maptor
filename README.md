# Maptor

Generate optimized multi-stop Google Maps routes from your browser. Paste Google Maps URLs as locations, choose your travel mode, and get a single shareable route link back.

**Live:** [maptor.ca](https://maptor.ca)

## Tech Stack

- **Frontend:** React 19, Webpack, Babel — deployed on GitHub Pages
- **Backend:** Node.js, Express — deployed on Render

## Project Structure

```
src/                  - React frontend
  ├── index.js        - Entry point
  ├── App.js          - Main component
  └── App.css         - Styles
server/               - Express backend
  ├── index.js        - Server entry point
  ├── routes/
  │   └── route.js    - POST /api/route/generate
  └── utils/
      └── index.js    - URL unshortening & coordinate extraction
public/
  └── index.html      - HTML template
```

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start the backend
```bash
npm run server
```
Runs the Express server at `http://localhost:5000`.

### 3. Start the frontend
```bash
npm start
```
Runs the React app at `http://localhost:3000`.

## API

### `POST /api/route/generate`
Generates a Google Maps multi-stop route link.

**Body:**
```json
{
  "locations": ["<google maps url>", "<google maps url>"],
  "travelmode": "driving | walking | bicycling | transit"
}
```

**Response:**
```json
{
  "routeUrl": "https://www.google.com/maps/dir/..."
}
```

### `GET /api/health`
Returns `{ "status": "ok" }`.

## Deployment

### Frontend (GitHub Pages)
```bash
npm run deploy
```
Builds the app and publishes to the `gh-pages` branch.

### Backend (Render)
Push changes to GitHub. Render auto-deploys from the repo using:
- **Build command:** `npm install`
- **Start command:** `node server/index.js`

## License

ISC

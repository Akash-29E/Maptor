const https = require('https');

// --- Unshorten a Google Maps short URL ---
function unshortenURL(shortUrl, maxHops = 5) {
  return new Promise((resolve, reject) => {
    if (maxHops === 0) return reject(new Error('Too many redirects'));

    const req = https.get(shortUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      res.resume();
      const { statusCode, headers } = res;

      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        const next = headers.location.startsWith('http')
          ? headers.location
          : new URL(headers.location, shortUrl).href;
        unshortenURL(next, maxHops - 1).then(resolve).catch(reject);
      } else {
        resolve(shortUrl);
      }
    });

    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// --- Extract lat/lng from a full Google Maps URL ---
function extractCoordinates(longUrl) {
  const match = longUrl.match(/@(-?[\d.]+),(-?[\d.]+)/);
  return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
}

// --- Geocode a plain text address using Google Maps Geocoding API ---
function geocodeAddress(address, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'OK' && json.results.length > 0) {
            const { lat, lng } = json.results[0].geometry.location;
            resolve({ lat, lng });
          } else {
            reject(new Error(`Geocoding failed for "${address}": ${json.status}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Geocoding timeout')); });
  });
}

// --- Haversine distance in km between two {lat, lng} points ---
function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// --- Nearest-neighbour reorder of waypoints (start and end stay fixed) ---
function nearestNeighbour(origin, waypoints, destination) {
  if (waypoints.length <= 1) return waypoints;
  const unvisited = [...waypoints];
  const ordered = [];
  let current = origin;
  while (unvisited.length > 0) {
    let nearest = null, nearestIdx = -1, minDist = Infinity;
    unvisited.forEach((wp, i) => {
      const d = haversine(current, wp.coords);
      if (d < minDist) { minDist = d; nearest = wp; nearestIdx = i; }
    });
    ordered.push(nearest);
    current = nearest.coords;
    unvisited.splice(nearestIdx, 1);
  }
  return ordered;
}

const COORD_PATTERN = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
const URL_PATTERN = /^https?:\/\//i;

// --- Resolve a location string to { label, coords } ---
async function resolveLocation(loc, apiKey) {
  const trimmed = loc.trim();
  if (COORD_PATTERN.test(trimmed)) {
    const [lat, lng] = trimmed.split(',').map(Number);
    return { label: trimmed, coords: { lat, lng } };
  }
  if (URL_PATTERN.test(trimmed)) {
    const longUrl = await unshortenURL(trimmed);
    const c = extractCoordinates(longUrl);
    if (!c) throw new Error(`Could not extract coordinates from URL: ${trimmed}`);
    return { label: `${c.lat},${c.lng}`, coords: c };
  }
  // Plain text address — geocode it
  const coords = await geocodeAddress(trimmed, apiKey);
  return { label: encodeURIComponent(trimmed), coords };
}

// --- Generate an optimized Google Maps route link ---
async function generateRouteLink(locationUrls, travelmode = 'driving', apiKey = '') {
  if (locationUrls.length < 2) {
    throw new Error('At least 2 locations are required to generate a route.');
  }

  const resolved = await Promise.all(locationUrls.map(loc => resolveLocation(loc, apiKey)));

  const origin      = resolved[0];
  const destination = resolved[resolved.length - 1];
  const waypoints   = resolved.slice(1, -1);

  // Reorder waypoints using nearest-neighbour only if coordinates are available
  const optimized = nearestNeighbour(origin.coords, waypoints, destination.coords);

  let routeUrl = `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.label}` +
    `&destination=${destination.label}` +
    `&travelmode=${travelmode}`;

  if (optimized.length > 0) {
    routeUrl += `&waypoints=${optimized.map(w => w.label).join('|')}`;
  }

  return routeUrl;
}

module.exports = { unshortenURL, extractCoordinates, generateRouteLink };


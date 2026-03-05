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

// --- Generate a Google Maps route link from an array of short/long URLs ---
async function generateRouteLink(locationUrls, travelmode = 'driving') {
  if (locationUrls.length < 2) {
    throw new Error('At least 2 locations are required to generate a route.');
  }

  const longUrls = await Promise.all(locationUrls.map(url => unshortenURL(url)));

  const coords = longUrls.map((url, i) => {
    const c = extractCoordinates(url);
    if (!c) throw new Error(`Could not extract coordinates from location ${i + 1}: ${url}`);
    return `${c.lat},${c.lng}`;
  });

  const origin      = coords[0];
  const destination = coords[coords.length - 1];
  const waypoints   = coords.slice(1, -1);

  let routeUrl = `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin}` +
    `&destination=${destination}` +
    `&travelmode=${travelmode}`;

  if (waypoints.length > 0) {
    routeUrl += `&waypoints=${waypoints.join('|')}`;
  }

  return routeUrl;
}

module.exports = { unshortenURL, extractCoordinates, generateRouteLink };


import React, { useState, useEffect } from 'react';
import { setOptions } from '@googlemaps/js-api-loader';
import './App.css';
import AddressInput from './components/AddressInput';

const API = process.env.NODE_ENV === 'production'
  ? 'https://maptor.onrender.com'
  : 'http://localhost:5000';

// Fetch and apply the Maps key exactly once at module load time
const mapsReadyPromise = fetch(`${API}/api/config`)
  .then(r => r.json())
  .then(({ mapsKey }) => {
    if (!mapsKey) throw new Error('PLACES_API_KEY is not configured on the server.');
    setOptions({ key: mapsKey });
  });

function App() {
  const emptyLocation = () => ({ address: '', lat: null, lng: null });
  const [start, setStart] = useState(emptyLocation());
  const [stops, setStops] = useState([emptyLocation()]);
  const [end, setEnd] = useState(emptyLocation());
  const [travelMode, setTravelMode] = useState('Driving');
  const [mapsReady, setMapsReady] = useState(false);
  const [routeUrl, setRouteUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mapsReadyPromise.then(() => {
      if (!cancelled) setMapsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const addStop = () => setStops([...stops, { address: '', lat: null, lng: null }]);
  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));
  const updateStop = (index, value) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], address: value, lat: null, lng: null };
    setStops(updated);
  };
  const updateStopCoords = (index, coords) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], ...coords };
    setStops(updated);
  };

  const handleSubmit = async () => {
    const allLocations = [start, ...stops, end].filter(loc => loc.address);
    const locations = allLocations.map(loc =>
      loc.lat != null && loc.lng != null ? `${loc.lat},${loc.lng}` : loc.address
    );
    if (locations.length < 2) {
      alert('Please enter at least a start and end point.');
      return;
    }
    const res = await fetch(`${API}/api/route/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, travelmode: travelMode.toLowerCase() }),
    });
    const data = await res.json();
    if (data.routeUrl) setRouteUrl(data.routeUrl);
    else alert(`Error: ${data.error}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(routeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/maptor_logo.svg" alt="Maptor logo" className="App-logo" />
        <h1 className='Header-text'>Maptor</h1><h2 className='Header-subtext'>.ca</h2>
        <div className="header-contact">
          <span className="header-contact-name"><a href="https://akashparmar.me" target="_blank" rel="noopener noreferrer" className='header-created-by'>Crafted by:</a></span>
          <span className="header-contact-name"><a href="https://akashparmar.me" target="_blank" rel="noopener noreferrer" className='header-contact-name'>Akash Parmar</a></span>
          <div className="header-contact-links">
            <a href="https://github.com/Akash-29E" target="_blank" rel="noopener noreferrer" className="header-contact-link" aria-label="GitHub">
              <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/parmar-akash/" target="_blank" rel="noopener noreferrer" className="header-contact-link" aria-label="LinkedIn">
              <svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </header>
      <main className="App-main">
        <section className="intro">
          <h2 className="intro-title">Plan your route, your way.</h2>
          <p className="intro-body">
            Maptor lets you build a multi-stop route, <strong>automatically optimizes the stop order</strong> for the shortest path, and opens it instantly in Google Maps — no account needed.
          </p>
          <ol className="intro-steps">
            <li>Enter a <strong>starting address</strong> and an <strong>ending address</strong>.</li>
            <li>Add as many <strong>stops</strong> in between as you need using the <strong>+</strong> button.</li>
            <li>Choose your preferred <strong>travel mode</strong> — Driving, Walking, Bicycling, or Transit.</li>
            <li>Hit <strong>Submit</strong> — Maptor optimizes the stop sequence for the shortest route and opens it in Google Maps.</li>
          </ol>
        </section>
        <div className="route-form">
          <label className="field-label">
            Starting Address:
            {mapsReady && <AddressInput className="route-input" placeholder="Starting Address" value={start.address}
              onChange={v => setStart({ address: v, lat: null, lng: null })}
              onPlaceSelect={coords => setStart(coords)} />}
          </label>

          {stops.map((stop, index) => (
            <div className="stop-row" key={index}>
              <label className="field-label">
                Stop {index + 1}:
                {mapsReady && <AddressInput
                  className="route-input"
                  placeholder={`Stop ${index + 1}`}
                  value={stop.address}
                  onChange={value => updateStop(index, value)}
                  onPlaceSelect={coords => updateStopCoords(index, coords)}
                />}
              </label>
              {index === stops.length - 1 && (
                <>
                  {stops.length > 1 && (
                    <button className="remove-stop-btn" onClick={() => removeStop(index)}>−</button>
                  )}
                  <button className="add-stop-btn" onClick={addStop}>+</button>
                </>
              )}
            </div>
          ))}

          <label className="field-label">
            Ending Address:
            {mapsReady && <AddressInput className="route-input" placeholder="Ending Address" value={end.address}
              onChange={v => setEnd({ address: v, lat: null, lng: null })}
              onPlaceSelect={coords => setEnd(coords)} />}
          </label>

          <div className="travel-mode-bar">
            {['Driving', 'Walking', 'Bicycling', 'Transit'].map((mode) => (
              <button
                key={mode}
                className={`travel-mode-btn${travelMode === mode ? ' active' : ''}`}
                onClick={() => setTravelMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <button className="submit-btn" onClick={handleSubmit}>Submit</button>

          {routeUrl && (
            <div className="route-result">
              <span className="route-result-label">Your optimized Google Maps link:</span>
              <div className="route-result-row">
                <a className="route-result-link" href={routeUrl} target="_blank" rel="noopener noreferrer">{routeUrl}</a>
                <button className="route-result-btn" onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
                <a className="route-result-btn route-result-open" href={routeUrl} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

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

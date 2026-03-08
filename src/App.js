import React, { useState } from 'react';
import './App.css';
import AddressInput from './components/AddressInput';

const API = process.env.NODE_ENV === 'production'
  ? 'https://maptor.onrender.com'
  : 'http://localhost:5000';

function App() {
  const emptyLocation = () => ({ address: '', lat: null, lng: null });
  const [start, setStart] = useState(emptyLocation());
  const [stops, setStops] = useState([emptyLocation()]);
  const [end, setEnd] = useState(emptyLocation());
  const [travelMode, setTravelMode] = useState('Driving');

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
    if (data.routeUrl) window.open(data.routeUrl, '_blank');
    else alert(`Error: ${data.error}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/maptor_logo.svg" alt="Maptor logo" className="App-logo" />
        <h1 className='Header-text'>Maptor</h1><h2 className='Header-subtext'>.ca</h2>
      </header>
      <main className="App-main">
        <div className="route-form">
          <label className="field-label">
            Start point
            <AddressInput className="route-input" placeholder="Starting point" value={start.address}
              onChange={v => setStart({ address: v, lat: null, lng: null })}
              onPlaceSelect={coords => setStart(coords)} />
          </label>

          {stops.map((stop, index) => (
            <div className="stop-row" key={index}>
              <label className="field-label">
                Stop {index + 1}
                <AddressInput
                  className="route-input"
                  placeholder={`Stop ${index + 1}`}
                  value={stop.address}
                  onChange={value => updateStop(index, value)}
                  onPlaceSelect={coords => updateStopCoords(index, coords)}
                />
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
            End point
            <AddressInput className="route-input" placeholder="End point" value={end.address}
              onChange={v => setEnd({ address: v, lat: null, lng: null })}
              onPlaceSelect={coords => setEnd(coords)} />
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
        </div>
      </main>
    </div>
  );
}

export default App;

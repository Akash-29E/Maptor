import React, { useState } from 'react';
import './App.css';

const API = process.env.NODE_ENV === 'production'
  ? 'https://render.onrender.com'
  : 'http://localhost:5000';

function App() {
  const [start, setStart] = useState('');
  const [stops, setStops] = useState(['']);
  const [end, setEnd] = useState('');
  const [travelMode, setTravelMode] = useState('Driving');

  const addStop = () => setStops([...stops, '']);
  const removeStop = (index) => setStops(stops.filter((_, i) => i !== index));
  const updateStop = (index, value) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);
  };

  const handleSubmit = async () => {
    const locations = [start, ...stops, end].filter(Boolean);
    const res = await fetch(`${API}/api/route/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, travelmode: travelMode.toLowerCase() }),
    });
    const data = await res.json();
    console.log('Route URL:', data.routeUrl);
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
            <input className="route-input" type="text" placeholder="Starting point" value={start} onChange={e => setStart(e.target.value)} />
          </label>

          {stops.map((stop, index) => (
            <div className="stop-row" key={index}>
              <label className="field-label">
                Stop {index + 1}
                <input
                  className="route-input"
                  type="text"
                  placeholder={`Stop ${index + 1}`}
                  value={stop}
                  onChange={e => updateStop(index, e.target.value)}
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
            <input className="route-input" type="text" placeholder="End point" value={end} onChange={e => setEnd(e.target.value)} />
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

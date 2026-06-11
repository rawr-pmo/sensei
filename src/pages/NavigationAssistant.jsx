import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import useTTS from '../hooks/useTTS.jsx';
import { geocodeAddress, getRoute } from '../services/routingService.js';

import 'leaflet/dist/leaflet.css';

// Fix default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);
  return null;
}

export default function NavigationAssistant() {
  const { speak, stop: stopSpeech, speaking } = useTTS();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device.');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationError('');
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleFindRoute = async () => {
    if (!currentLocation) {
      setRouteError('Waiting for your current location.');
      return;
    }
    if (!destination.trim()) {
      setRouteError('Please enter a destination.');
      return;
    }

    setLoading(true);
    setRouteError('');
    setRoute(null);
    setStepIndex(0);

    try {
      const dest = await geocodeAddress(destination);
      const result = await getRoute(currentLocation, { lat: dest.lat, lon: dest.lon });
      setRoute(result);
      const distanceKm = (result.distance / 1000).toFixed(1);
      const minutes = Math.round(result.duration / 60);
      const summary = `Route found. Total distance ${distanceKm} kilometers, approximately ${minutes} minutes walking. ${result.steps[0]?.instruction || ''}`;
      speak(summary);
    } catch (e) {
      setRouteError(e.message);
      speak('Sorry, I could not find a route to that destination.');
    } finally {
      setLoading(false);
    }
  };

  const speakStep = (index) => {
    const step = route?.steps?.[index];
    if (step) speak(step.instruction);
  };

  const nextStep = () => {
    if (!route) return;
    const next = Math.min(stepIndex + 1, route.steps.length - 1);
    setStepIndex(next);
    speakStep(next);
  };

  const prevStep = () => {
    if (!route) return;
    const prev = Math.max(stepIndex - 1, 0);
    setStepIndex(prev);
    speakStep(prev);
  };

  const bounds = route ? L.latLngBounds(route.coordinates) : null;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-extrabold text-gray-900">Navigation Assistant</h2>
      <p className="text-base text-gray-600">
        Enter a destination to get a walking route with step-by-step voice guidance.
      </p>

      {locationError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {locationError}
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="destination" className="block text-lg font-bold text-gray-800">
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. MG Road, Bengaluru"
          className="w-full p-4 text-xl rounded-2xl border-2 border-gray-300 focus:border-sensei-purple"
        />
        <button
          onClick={handleFindRoute}
          disabled={loading}
          className="w-full p-5 rounded-2xl bg-sensei-blue text-white text-xl font-extrabold shadow disabled:opacity-50 active:scale-95 transition"
        >
          {loading ? '⏳ Finding Route...' : '🧭 Get Directions'}
        </button>
      </div>

      {routeError && (
        <div role="alert" className="p-4 bg-red-100 border-2 border-red-400 rounded-2xl text-red-800 font-semibold">
          {routeError}
        </div>
      )}

      {currentLocation && (
        <div className="rounded-3xl overflow-hidden h-72">
          <MapContainer center={[currentLocation.lat, currentLocation.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.lat, currentLocation.lon]}>
              <Popup>You are here</Popup>
            </Marker>
            {route && (
              <>
                <Polyline positions={route.coordinates} color="#6D28D9" weight={6} />
                <Marker position={route.coordinates[route.coordinates.length - 1]}>
                  <Popup>Destination</Popup>
                </Marker>
                <MapUpdater bounds={bounds} />
              </>
            )}
          </MapContainer>
        </div>
      )}

      {route && (
        <div className="p-5 bg-white rounded-2xl shadow-lg space-y-4" role="region" aria-label="Turn by turn directions">
          <div className="flex justify-between text-base font-semibold text-gray-700">
            <span>📏 {(route.distance / 1000).toFixed(2)} km</span>
            <span>⏱️ {Math.round(route.duration / 60)} min walk</span>
          </div>

          <div className="p-4 bg-sensei-purple text-white rounded-2xl" aria-live="polite">
            <p className="text-sm font-semibold opacity-80">
              Step {stepIndex + 1} of {route.steps.length}
            </p>
            <p className="text-xl font-bold mt-1">{route.steps[stepIndex]?.instruction}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="p-4 rounded-2xl bg-gray-700 text-white text-lg font-bold shadow disabled:opacity-50 active:scale-95 transition"
            >
              ⬅️ Back
            </button>
            <button
              onClick={() => (speaking ? stopSpeech() : speakStep(stepIndex))}
              className="p-4 rounded-2xl bg-sensei-orange text-white text-lg font-bold shadow active:scale-95 transition"
            >
              {speaking ? '🔇 Stop' : '🔊 Repeat'}
            </button>
            <button
              onClick={nextStep}
              disabled={stepIndex === route.steps.length - 1}
              className="p-4 rounded-2xl bg-sensei-green text-white text-lg font-bold shadow disabled:opacity-50 active:scale-95 transition"
            >
              Next ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
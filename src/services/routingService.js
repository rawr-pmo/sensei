const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OSRM_URL = 'https://router.project-osrm.org';

export async function geocodeAddress(query) {
  const url = `${NOMINATIM_URL}/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' }
  });
  if (!res.ok) throw new Error('Geocoding failed.');
  const data = await res.json();
  if (!data.length) throw new Error('Destination not found.');
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}

export async function getRoute(start, end) {
  const url = `${OSRM_URL}/route/v1/foot/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service failed.');
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found.');

  const route = data.routes[0];
  const steps = route.legs[0].steps.map((step) => ({
    instruction: buildInstruction(step),
    distance: step.distance,
    duration: step.duration
  }));

  return {
    coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distance: route.distance,
    duration: route.duration,
    steps
  };
}

function buildInstruction(step) {
  const maneuver = step.maneuver?.type || 'continue';
  const modifier = step.maneuver?.modifier;
  const name = step.name ? ` onto ${step.name}` : '';

  switch (maneuver) {
    case 'depart':
      return `Head ${modifier || 'forward'}${name}.`;
    case 'arrive':
      return 'You have arrived at your destination.';
    case 'turn':
      return `Turn ${modifier}${name}.`;
    case 'new name':
      return `Continue${name}.`;
    case 'roundabout':
      return `Enter the roundabout and take the exit${name}.`;
    default:
      return `Continue ${modifier || 'straight'}${name}.`;
  }
}
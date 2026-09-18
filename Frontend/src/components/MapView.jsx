import { useMemo } from "react";

const FALLBACK_CENTER = { lat: 23.0225, lng: 72.5714 };

function validPoint(point) {
  return Number.isFinite(point?.lat) && Number.isFinite(point?.lng);
}

function getBounds(points) {
  const usable = points.filter(validPoint);
  if (!usable.length) return { south: 22.98, west: 72.51, north: 23.07, east: 72.64 };
  const lats = usable.map((point) => point.lat);
  const lngs = usable.map((point) => point.lng);
  const padding = 0.02;
  return {
    south: Math.min(...lats) - padding,
    west: Math.min(...lngs) - padding,
    north: Math.max(...lats) + padding,
    east: Math.max(...lngs) + padding,
  };
}

function position(point, bounds) {
  if (!validPoint(point)) return null;
  const left = ((point.lng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const top = ((bounds.north - point.lat) / (bounds.north - bounds.south)) * 100;
  return { left: `${Math.min(96, Math.max(4, left))}%`, top: `${Math.min(96, Math.max(4, top))}%` };
}

const Marker = ({ label, point, bounds, color }) => {
  const style = position(point, bounds);
  if (!style) return null;
  return <span className={`map-marker ${color}`} style={style} title={label}>{label.slice(0, 1)}</span>;
};

const MapView = ({ pickup, destination, driverLocation, className = "" }) => {
  const driver = useMemo(() => (Array.isArray(driverLocation?.coordinates)
    ? { lat: driverLocation.coordinates[1], lng: driverLocation.coordinates[0] }
    : driverLocation), [driverLocation]);
  const bounds = useMemo(() => getBounds([pickup, destination, driver]), [pickup, destination, driver]);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.west}%2C${bounds.south}%2C${bounds.east}%2C${bounds.north}&layer=mapnik`;
  const hasLocation = validPoint(pickup) || validPoint(destination) || validPoint(driver);

  return (
    <div className={`map-view ${className}`}>
      <iframe title="OpenStreetMap ride map" src={src} loading="lazy" />
      <Marker label="Pickup" point={pickup} bounds={bounds} color="pickup" />
      <Marker label="Destination" point={destination} bounds={bounds} color="destination" />
      <Marker label="Driver" point={driver} bounds={bounds} color="driver" />
      {!hasLocation && <div className="map-empty">Map location will appear after you select a place.</div>}
    </div>
  );
};

export { FALLBACK_CENTER };
export default MapView;

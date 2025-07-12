'use client';

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import 'leaflet/dist/leaflet.css';

type MapViewProps = {
  center: { lat: number; lng: number };
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  paths?: Array<{
    points: Array<{ lat: number; lng: number }>;
    color?: string;
  }>;
  polygons?: Array<{
    points: Array<{ lat: number; lng: number }>;
    color?: string;
    fillColor?: string;
  }>;
  zoom?: number;
  onMapClick?: (location: { lat: number; lng: number }) => void;
};

// Fix Leaflet default icon path issue
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Map tile layers for light and dark modes
const TILE_LAYERS = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
};

// Map attribution
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Component to handle map click events
function MapEvents({
  onMapClick,
}: {
  onMapClick?: (location: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export default function MapView({
  center,
  markers = [],
  paths = [],
  polygons = [],
  zoom = 13,
  onMapClick,
}: MapViewProps) {
  const { theme } = useTheme();

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution={ATTRIBUTION}
        url={theme === 'dark' ? TILE_LAYERS.dark : TILE_LAYERS.light}
      />

      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          position={[marker.position.lat, marker.position.lng]}
          icon={
            marker.icon
              ? new L.Icon({
                  iconUrl: marker.icon,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })
              : undefined
          }
        >
          {marker.title && <Popup>{marker.title}</Popup>}
        </Marker>
      ))}

      {paths.map((path, index) => (
        <Polyline
          key={`path-${index}`}
          positions={path.points.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: path.color || '#FF0000',
            weight: 2,
          }}
        />
      ))}

      {polygons.map((polygon, index) => (
        <Polygon
          key={`polygon-${index}`}
          positions={polygon.points.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: polygon.color || '#FF0000',
            fillColor: polygon.fillColor || '#FF0000',
            fillOpacity: 0.35,
            weight: 2,
          }}
        />
      ))}

      <MapEvents onMapClick={onMapClick} />
    </MapContainer>
  );
}

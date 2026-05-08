import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES, DARK_MAP_STYLES, DEFAULT_CENTER, STATUS_COLORS } from '../utils/mapsConfig';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function GoogleMapView({ complaints = [], height = '400px' }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [selected, setSelected] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Auto-center on user's geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCenter(DEFAULT_CENTER)
    );
  }, []);

  const getMarkerIcon = useCallback((status) => {
    if (!window.google) return undefined;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: STATUS_COLORS[status] || STATUS_COLORS['resolved'],
      fillOpacity: 1,
      strokeColor: 'rgba(255,255,255,0.9)',
      strokeWeight: 2.5,
      scale: 12,
    };
  }, []);

  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Pending';
    if (status === 'in-progress') return 'In Progress';
    return 'Resolved';
  };

  if (loadError) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--danger)', margin: 0 }}>Failed to load Google Maps. Check API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="skeleton" style={{ width: '100%', height, borderRadius: '12px' }} />;
  }

  const validComplaints = complaints.filter(c => c.lat && c.lng);

  return (
    <div style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={12}
        options={MAP_OPTIONS}
        onLoad={setMapInstance}
      >
        {mapInstance && validComplaints.map(c => (
          <Marker
            key={c.id}
            position={{ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }}
            icon={getMarkerIcon(c.status)}
            animation={window.google.maps.Animation.DROP}
            onClick={() => setSelected(c)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: parseFloat(selected.lat), lng: parseFloat(selected.lng) }}
            onCloseClick={() => setSelected(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -10) }}
          >
            <div className="gmap-infowindow">
              {selected.image && (
                <img src={selected.image} alt="Evidence" className="gmap-iw-image" />
              )}
              <h4 className="gmap-iw-title">{selected.title}</h4>
              <p className="gmap-iw-location">📍 {selected.location}</p>
              <div className="gmap-iw-badges">
                <span className="gmap-badge gmap-badge-category">{selected.category}</span>
                <span
                  className="gmap-badge"
                  style={{
                    background: `${STATUS_COLORS[selected.status]}20`,
                    color: STATUS_COLORS[selected.status],
                    border: `1px solid ${STATUS_COLORS[selected.status]}40`,
                  }}
                >
                  {getStatusLabel(selected.status)}
                </span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

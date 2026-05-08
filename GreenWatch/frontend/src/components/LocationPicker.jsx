import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES, DARK_MAP_STYLES, DEFAULT_CENTER } from '../utils/mapsConfig';
import { Navigation } from 'lucide-react';

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
};

export default function LocationPicker({ onLocationSelect, initialCenter = null }) {
  const [center, setCenter] = useState(initialCenter || DEFAULT_CENTER);
  const [markerPos, setMarkerPos] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Auto-center on user's geolocation
  useEffect(() => {
    if (initialCenter) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCenter(DEFAULT_CENTER)
    );
  }, [initialCenter]);

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const address = (status === 'OK' && results[0])
        ? results[0].formatted_address
        : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onLocationSelect({ lat, lng, address });
    });
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const newCenter = { lat, lng };
      setCenter(newCenter);
      setMarkerPos(newCenter);
      setSearchValue(place.formatted_address);
      onLocationSelect({ lat, lng, address: place.formatted_address });
      mapRef.current?.panTo(newCenter);
      mapRef.current?.setZoom(16);
    }
  };

  const recenter = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(loc);
      mapRef.current?.panTo(loc);
    });
  };

  if (!isLoaded) {
    return <div className="skeleton" style={{ height: '280px', borderRadius: '12px' }} />;
  }

  return (
    <div className="location-picker-wrapper">
      {/* Autocomplete Search */}
      <Autocomplete
        onLoad={(ac) => (autocompleteRef.current = ac)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          type="text"
          className="form-control location-picker-search"
          placeholder="Search address or landmark..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Autocomplete>

      {/* Map Container */}
      <div className="location-picker-map">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={14}
          options={MAP_OPTIONS}
          onLoad={(map) => (mapRef.current = map)}
          onClick={handleMapClick}
        >
          {markerPos && (
            <Marker
              position={markerPos}
              animation={window.google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        {/* Recenter Button */}
        <button
          type="button"
          className="location-recenter-btn"
          onClick={recenter}
          title="Use my location"
        >
          <Navigation size={16} />
        </button>
      </div>

      <p className="location-picker-hint">
        {markerPos ? '✅ Location pinned. Click elsewhere to adjust.' : 'Click on map or search above to pin location.'}
      </p>
    </div>
  );
}

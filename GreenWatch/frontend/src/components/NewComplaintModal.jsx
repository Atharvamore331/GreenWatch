import React, { useState, useRef } from 'react';
import { X, MapPin, Layers, Send, AlertCircle, Upload, Image as ImageIcon, Trash2, Map } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useAppContext } from '../context/AppContext';
import LocationPicker from './LocationPicker';
import { MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '../utils/mapsConfig';

export default function NewComplaintModal({ isOpen, onClose }) {
  const { submitComplaint, user } = useAppContext();
  const fileInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    category: 'garbage',
    location: '',
    image: '',
  });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (!isOpen) return null;

  // ── File Handling ──────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { setError('Please upload a valid image (JPG, PNG, or WEBP).'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File size too large. Maximum limit is 5MB.'); return; }

    setUploading(true);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => { setFormData(f => ({ ...f, image: reader.result })); setUploading(false); };
    reader.onerror = () => { setError('Failed to process image file.'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  // ── Location Handling ──────────────────────────────────────────
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoords({ lat, lng });
      setFormData(f => ({ ...f, location: place.formatted_address }));
    }
  };

  const handleLocationPickerSelect = ({ lat, lng, address }) => {
    setCoords({ lat, lng });
    setFormData(f => ({ ...f, location: address }));
  };

  // ── Submission ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.title || !formData.desc || !formData.location) {
      setError('Please fill out all required fields.'); return;
    }

    // Use real coords if available, otherwise random offset near user location
    const lat = coords.lat ?? (12.9716 + (Math.random() - 0.5) * 0.1);
    const lng = coords.lng ?? (77.5946 + (Math.random() - 0.5) * 0.1);

    setIsSubmitting(true);
    setError('');
    try {
      await submitComplaint({ citizenId: user.id, lat, lng, ...formData });
      setFormData({ title: '', desc: '', category: 'garbage', location: '', image: '' });
      setCoords({ lat: null, lng: null });
      setShowMapPicker(false);
      onClose();
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content card slide-up">
        <div className="modal-header">
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Report Environmental Incident</h3>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-alert fade-in"><AlertCircle size={16} /> {error}</div>
          )}

          {/* Title + Category */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input
                type="text" className="form-control" required
                placeholder="E.g., Illegal dumping in local park"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Classification</label>
              <div style={{ position: 'relative' }}>
                <Layers size={18} className="input-icon-left" />
                <select
                  className="form-control" style={{ paddingLeft: '2.75rem', appearance: 'none' }}
                  value={formData.category}
                  onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="garbage">Garbage / Waste</option>
                  <option value="water">Water Pollution</option>
                  <option value="air">Air Pollution</option>
                  <option value="trees">Deforestation</option>
                  <option value="noise">Noise Pollution</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location with Places Autocomplete */}
          <div className="form-group">
            <label className="form-label">Location Details</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} className="input-icon-left" />
              {isLoaded ? (
                <Autocomplete
                  onLoad={ac => (autocompleteRef.current = ac)}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <input
                    type="text" className="form-control" style={{ paddingLeft: '2.75rem' }} required
                    placeholder="Search address or landmark..."
                    value={formData.location}
                    onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text" className="form-control" style={{ paddingLeft: '2.75rem' }}
                  placeholder="Loading location services..." disabled
                />
              )}
            </div>
            {/* Map Picker Toggle */}
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem', fontSize: '0.82rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
              onClick={() => setShowMapPicker(v => !v)}
            >
              <Map size={14} /> {showMapPicker ? 'Hide Map Picker' : 'Pick Location on Map'}
            </button>

            {/* Inline Map Picker */}
            {showMapPicker && (
              <div className="fade-in" style={{ marginTop: '0.75rem' }}>
                <LocationPicker onLocationSelect={handleLocationPickerSelect} />
              </div>
            )}

            {/* Coordinate confirmation pill */}
            {coords.lat && (
              <div className="coords-pill fade-in">
                📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — location confirmed
              </div>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="form-group">
            <label className="form-label">Evidence Upload</label>
            {!formData.image ? (
              <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                  accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                {uploading ? (
                  <div className="upload-loading"><div className="spinner" /><span>Processing Evidence...</span></div>
                ) : (
                  <>
                    <Upload size={32} className="upload-icon" />
                    <p>Drag & drop photo or <span>Browse Files</span></p>
                    <span className="upload-hint">Supports JPG, PNG, WEBP (Max 5MB)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="preview-container fade-in">
                <img src={formData.image} alt="Preview" className="evidence-preview" />
                <div className="preview-overlay">
                  <div className="preview-info"><ImageIcon size={16} /><span>Evidence Captured</span></div>
                  <button type="button" className="remove-btn" onClick={() => setFormData(f => ({ ...f, image: '' }))}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-control" rows="3" required
              placeholder="Describe the environmental concern in detail..."
              value={formData.desc}
              onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting || uploading}>
            {isSubmitting
              ? <><div className="spinner-sm" /> Transmitting Report...</>
              : <>Submit Environmental Report <Send size={18} /></>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

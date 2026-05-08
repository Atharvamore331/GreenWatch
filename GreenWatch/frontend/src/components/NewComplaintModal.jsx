import React, { useState, useRef } from 'react';
import { X, MapPin, Layers, Send, Camera, AlertCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function NewComplaintModal({ isOpen, onClose }) {
  const { submitComplaint, user } = useAppContext();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    category: 'garbage',
    location: '',
    image: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum limit is 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to process image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.title || !formData.desc || !formData.location) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Generate slight offset coordinates near Bangalore to guarantee map marker placement
    const centerLat = 12.9716;
    const centerLng = 77.5946;
    const lat = centerLat + (Math.random() - 0.5) * 0.1;
    const lng = centerLng + (Math.random() - 0.5) * 0.1;

    try {
      await submitComplaint({
        citizenId: user.id,
        lat,
        lng,
        ...formData
      });
      // Clear and close
      setFormData({ title: '', desc: '', category: 'garbage', location: '', image: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setError('An error occurred during transmission. Please retry.');
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
            <div className="error-alert fade-in">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input 
                type="text" className="form-control" required
                placeholder="E.g., Illegal dumping in local park"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Classification</label>
              <div style={{ position: 'relative' }}>
                <Layers size={18} className="input-icon-left" />
                <select 
                  className="form-control" style={{ paddingLeft: '2.75rem', appearance: 'none' }}
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
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

          <div className="form-group">
            <label className="form-label">Location Details</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} className="input-icon-left" />
              <input 
                type="text" className="form-control" style={{ paddingLeft: '2.75rem' }} required
                placeholder="Nearby address or landmark"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Evidence Upload</label>
            {!formData.image ? (
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" ref={fileInputRef} style={{ display: 'none' }} 
                  accept="image/*" onChange={(e) => handleFile(e.target.files[0])}
                />
                {uploading ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Processing Evidence...</span>
                  </div>
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
                  <div className="preview-info">
                    <ImageIcon size={16} />
                    <span>Evidence Captured</span>
                  </div>
                  <button type="button" className="remove-btn" onClick={removeImage}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea 
              className="form-control" rows="3" required
              placeholder="Describe the environmental concern in detail..."
              value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting || uploading}>
            {isSubmitting ? (
              <>
                <div className="spinner-sm"></div> Transmitting Report...
              </>
            ) : (
              <>
                Submit Environmental Report <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

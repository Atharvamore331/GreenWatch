import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Shield, MapPin, AlertCircle, Maximize2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';

export default function MapPage() {
  const { complaints, isLoading } = useAppContext();

  const getMarkerColor = (status) => {
    if (status === 'pending') return 'var(--warning)';
    if (status === 'in-progress') return 'var(--secondary)';
    return 'var(--primary)';
  };

  return (
    <Layout>
      <div className="fade-in" style={{ height: 'calc(100vh - var(--topbar-height) - 4rem)', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Environmental Activity Map</h1>
            <p style={{ color: 'var(--text-muted)' }}>Real-time spatial visualization of environmental reports.</p>
          </div>
          <div className="flex-center" style={{ gap: '1rem' }}>
             <div className="badge badge-resolved">Resolved</div>
             <div className="badge badge-progress">In-Progress</div>
             <div className="badge badge-pending">Pending</div>
          </div>
        </div>

        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {isLoading ? (
            <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
          ) : (
            <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {complaints.map(c => (
                c.lat && c.lng && (
                  <React.Fragment key={c.id}>
                    <Circle 
                      center={[c.lat, c.lng]} 
                      pathOptions={{ color: getMarkerColor(c.status), fillColor: getMarkerColor(c.status), fillOpacity: 0.2 }} 
                      radius={400} 
                    />
                    <Marker position={[c.lat, c.lng]}>
                      <Popup className="premium-popup">
                        <div style={{ minWidth: '200px', padding: '0.5rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{c.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                            <MapPin size={12} /> {c.location}
                          </div>
                          <div className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`} style={{ fontSize: '0.65rem' }}>
                            {c.status.toUpperCase()}
                          </div>
                          <hr style={{ margin: '0.75rem 0', opacity: 0.1 }} />
                          <button className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem' }}>
                            Open Activity Report
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                )
              ))}
            </MapContainer>
          )}
        </div>

        <div className="flex-center mt-4" style={{ gap: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> <span>Dynamic clustering enabled</span>
          </div>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <Shield size={16} /> <span>Environmental Monitoring Active</span>
          </div>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <Maximize2 size={16} /> <span>Edge-to-edge rendering</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

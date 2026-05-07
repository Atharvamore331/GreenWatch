import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin, AlertTriangle, Info, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { createRipple } from './Dashboard';

const API_URL = 'http://localhost:5000/api';
const MAP_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const createCustomClusterIcon = (cluster) => {
  return new L.divIcon({
    html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
    className: 'custom-cluster-wrapper',
    iconSize: L.point(40, 40, true),
  });
};

export default function Map() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) return navigate('/');
    const u = JSON.parse(userStr);
    setUser(u);
    
    fetchComplaints().then(() => {
      // Defer heavy map rendering
      setTimeout(() => setIsMapLoaded(true), 300);
    });
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverity = (category) => {
    if (['water', 'air'].includes(category)) return 'high';
    if (['trees'].includes(category)) return 'medium';
    return 'low';
  };

  const createMarkerIcon = (severity) => {
    return new L.divIcon({
      className: `custom-marker severity-${severity}`,
      html: `<div class="marker-pulse"></div><div class="marker-core"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  };

  if (!user) return null;

  return (
    <div className={user.role === 'admin' ? 'admin-bg' : 'dashboard-bg'}>
      <Layout>
        <div className="page-enter" style={{ position: 'relative', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '280px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" /> Intelligence Map
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>Live environmental threat tracking.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }}></div> High Severity</span>
                <span style={{ fontWeight: 600 }}>{complaints.filter(c => getSeverity(c.category) === 'high').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }}></div> Medium Severity</span>
                <span style={{ fontWeight: 600 }}>{complaints.filter(c => getSeverity(c.category) === 'medium').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></div> Low Severity</span>
                <span style={{ fontWeight: 600 }}>{complaints.filter(c => getSeverity(c.category) === 'low').length}</span>
              </div>
            </div>
            
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={12} /> Clicking a cluster expands the area.
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', margin: '0 1.5rem 1.5rem 1.5rem' }}>
            {!isMapLoaded ? (
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 0 }}></div>
            ) : (
              <MapContainer center={[51.505, -0.09]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={true} className="page-enter">
                <TileLayer url={MAP_TILES} />
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon}>
                  {complaints.map(c => {
                    if (!c.lat || !c.lng) return null;
                    const severity = getSeverity(c.category);
                    return (
                      <Marker key={c.id} position={[c.lat, c.lng]} icon={createMarkerIcon(severity)}>
                        <Popup>
                          <div style={{ textAlign: 'center', minWidth: '180px', padding: '0.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'white' }}>{c.title}</h4>
                            <span className={`badge badge-severity-${severity}`} style={{ fontSize: '0.65rem', marginBottom: '0.75rem', display: 'inline-block' }}>{severity.toUpperCase()}</span>
                            
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                              <MapPin size={12} /> {c.location}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                              <Clock size={12} /> {new Date(c.createdAt).toLocaleDateString()}
                            </div>
                            
                            {c.image && <img src={c.image} alt="preview" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }} />}
                            
                            <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`} style={{ width: '100%', display: 'block', padding: '0.4rem 0' }}>
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </div>

        </div>
      </Layout>
    </div>
  );
}

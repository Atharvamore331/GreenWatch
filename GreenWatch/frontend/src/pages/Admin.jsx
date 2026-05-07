import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Shield, TrendingUp, AlertCircle, CheckCircle, Download, LayoutGrid, List, MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const downloadCSV = () => {
    const headers = ['Title', 'Category', 'Description', 'Location', 'Status', 'Date'];
    const rows = complaints.map(c => [
      c.title, c.category, c.desc.replace(/,/g, ' '), c.location, c.status, new Date(c.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "greenwatch_intelligence_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    return true;
  });

  const stats = [
    { label: 'Pending Critical', count: complaints.filter(c => c.status === 'pending').length, color: 'var(--warning)', icon: <AlertCircle size={20} /> },
    { label: 'Intelligence In Progress', count: complaints.filter(c => c.status === 'in-progress').length, color: 'var(--secondary)', icon: <TrendingUp size={20} /> },
    { label: 'Successfully Resolved', count: complaints.filter(c => c.status === 'resolved').length, color: 'var(--primary)', icon: <CheckCircle size={20} /> },
  ];

  return (
    <Layout>
      <div className="fade-in">
        {/* Header Section */}
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Command Intelligence</h1>
            <p style={{ color: 'var(--text-muted)' }}>Global Environmental Crisis Management System</p>
          </div>
          <button onClick={downloadCSV} className="btn btn-primary">
            <Download size={18} /> Export Intel (CSV)
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--s-6)', marginBottom: 'var(--s-12)' }}>
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }}></div>)
          ) : (
            stats.map((s, i) => (
              <div key={i} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div className="flex-between">
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.label}</p>
                    <h2 style={{ color: s.color, fontWeight: 800, fontSize: '2.5rem' }}>{s.count}</h2>
                  </div>
                  <div style={{ color: s.color, opacity: 0.8, background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Intelligence Heatmap */}
        <div className="card mb-8" style={{ minHeight: '450px' }}>
          <div className="flex-between mb-8">
            <h3 className="flex-center" style={{ gap: '0.75rem' }}>
              <Shield size={20} color="var(--primary)" /> Real-time Anomaly Heatmap
            </h3>
            <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
              <button className="btn btn-ghost btn-sm"><LayoutGrid size={16} /> Hotspots</button>
              <button className="btn btn-ghost btn-sm"><List size={16} /> Log View</button>
            </div>
          </div>
          <div style={{ height: '320px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {filteredComplaints.map(c => (
                c.lat && c.lng && (
                  <Marker key={c.id} position={[c.lat, c.lng]}>
                    <Popup>
                      <div style={{ color: '#1e293b', fontWeight: 600 }}>{c.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.location}</div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Incident Management Table */}
        <div className="card">
          <div className="flex-between mb-8">
            <h3>Incident Management Database</h3>
            <div className="flex-center" style={{ gap: 'var(--s-4)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input className="form-control" style={{ width: '220px', paddingLeft: '2.5rem', fontSize: '0.875rem' }} placeholder="Filter by ID or location..." />
              </div>
              <select className="form-control" style={{ width: 'auto', fontSize: '0.875rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Intelligence ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classification</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Coordinates/Address</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Operation Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}><td colSpan="5"><div className="skeleton" style={{ height: '50px', margin: '0.5rem 0' }}></div></td></tr>
                  ))
                ) : filteredComplaints.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }} className="fade-in">
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(c.createdAt).toLocaleString()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <div className="flex-center" style={{ gap: '0.4rem', justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
                        <MapPin size={14} /> {c.location}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        className="form-control" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto', fontWeight: 600 }}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">Deploying</option>
                        <option value="resolved">Neutralized</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>View Intel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

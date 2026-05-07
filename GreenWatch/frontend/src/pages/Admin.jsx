import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Shield, TrendingUp, AlertCircle, CheckCircle, Download, LayoutGrid, List } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
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
      setIsLoading(false);
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
    link.setAttribute("download", "greenwatch_reports.csv");
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
    { label: 'Pending', count: complaints.filter(c => c.status === 'pending').length, color: 'var(--warning)', icon: <AlertCircle /> },
    { label: 'In Progress', count: complaints.filter(c => c.status === 'in-progress').length, color: 'var(--secondary)', icon: <TrendingUp /> },
    { label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length, color: 'var(--primary)', icon: <CheckCircle /> },
  ];

  return (
    <Layout>
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Admin Command Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>Environmental Intelligence & Crisis Management</p>
          </div>
          <button onClick={downloadCSV} className="btn btn-primary">
            <Download size={18} /> Export Data
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{s.label} Reports</p>
                  <h2 style={{ fontSize: '2.5rem', color: s.color }}>{s.count}</h2>
                </div>
                <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap & Management Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ minHeight: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} color="var(--primary)" /> Environmental Intelligence Heatmap
            </h3>
            <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {filteredComplaints.map(c => (
                  c.lat && c.lng && (
                    <Marker key={c.id} position={[c.lat, c.lng]}>
                      <Popup>
                        <div style={{ color: '#000' }}>
                          <p><strong>{c.title}</strong></p>
                          <p>{c.location}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <LayoutGrid size={18} /> View All Hotspots
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <List size={18} /> Recent Activity Logs
              </button>
            </div>
          </div>
        </div>

        {/* Management Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Manage Incidents</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Incident</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Location</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{c.location}</td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        className="form-control" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setSelectedComplaint(c)}>Details</button>
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

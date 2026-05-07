import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Shield, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const u = JSON.parse(userStr);
    if (u.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setUser(u);
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/complaints/${id}/status`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleAssignTeam = async (id, teamName) => {
    try {
      await axios.patch(`${API_URL}/complaints/${id}/status`, { assignedTo: teamName });
      fetchComplaints();
      if (selectedComplaint) setSelectedComplaint(prev => ({...prev, assignedTo: teamName}));
    } catch (err) {
      alert("Error assigning team");
    }
  };

  const downloadCSV = () => {
    const headers = ['Title', 'Category', 'Description', 'Location', 'Status', 'Assigned To', 'Date'];
    const rows = complaints.map(c => [
      c.title, c.category, c.desc.replace(/,/g, ' '), c.location, c.status, c.assignedTo || 'None', new Date(c.createdAt).toLocaleDateString()
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

  const handleLogout = () => {
    localStorage.removeItem('greenwatch_current_user');
    navigate('/');
  };

  if (!user) return null;

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    return true;
  });

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const progressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="admin-bg">
      <nav className="navbar" style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)'}}>
        <div className="container nav-content">
          <div className="logo" style={{color: 'var(--primary)', fontWeight:'bold', fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <Shield /> GreenWatch Admin
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <span style={{fontWeight:600}}>Hello, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-outline" style={{padding:'0.4rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{marginTop:'2rem', marginBottom:'4rem', flex: 1}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
          <h2 style={{color: 'white', fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>Admin Management Suite</h2>
          <button onClick={downloadCSV} className="btn btn-primary" style={{boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'}}>📊 Generate CSV Report</button>
        </div>
        <div className="grid grid-cols-2" style={{marginBottom:'2rem'}}>
          <div className="card">
            <h3>System Overview</h3>
            <div style={{display:'flex', gap:'2rem', marginTop:'1rem'}}>
              <div>
                <p className="form-label">Pending</p>
                <h2 style={{color:'var(--warning)'}}>{pendingCount}</h2>
              </div>
              <div>
                <p className="form-label">In Progress</p>
                <h2 style={{color:'var(--secondary)'}}>{progressCount}</h2>
              </div>
              <div>
                <p className="form-label">Resolved</p>
                <h2 style={{color:'var(--success)'}}>{resolvedCount}</h2>
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Pollution Heatmap</h3>
            <div style={{height:'150px', width:'100%', borderRadius:'0.5rem', overflow:'hidden', marginTop:'0.5rem'}}>
              <MapContainer center={[51.505, -0.09]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredComplaints.map(c => (
                  c.lat && c.lng && (
                    <Marker key={c.id} position={[c.lat, c.lng]}>
                      <Popup>
                        <b>{c.title}</b><br/>Status: {c.status}
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Repeated Problems Card */}
        <div className="card" style={{marginBottom:'2rem'}}>
          <h3>⚠️ Repeated Problems / Hot Spots</h3>
          <div style={{display:'flex', gap:'2rem', marginTop:'1rem', flexWrap:'wrap'}}>
            {Object.entries(
              complaints.reduce((acc, c) => {
                acc[c.category] = (acc[c.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([cat, count]) => (
              <div key={cat} style={{padding:'1rem', background:'var(--light)', borderRadius:'var(--radius-md)', textAlign:'center', minWidth:'120px'}}>
                <span style={{textTransform:'capitalize', fontWeight:600}}>{cat}</span>
                <h3 style={{color:'var(--danger)', marginTop:'0.5rem'}}>{count} times</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <h3>Manage Complaints</h3>
          </div>
          
          <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', background:'var(--light)', padding:'1rem', borderRadius:'0.5rem'}}>
            <select className="form-control" style={{width:'auto', minWidth:'150px'}} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select className="form-control" style={{width:'auto', minWidth:'150px'}} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="garbage">Garbage</option>
              <option value="air">Air Pollution</option>
              <option value="water">Water Pollution</option>
              <option value="trees">Tree Cutting</option>
            </select>
          </div>

          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Image</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Title</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Location</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Date</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Citizen</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Status</th>
                  <th style={{padding:'1rem', textAlign:'left', borderBottom:'1px solid var(--border)', background:'var(--light)'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem'}}>No complaints found.</td></tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr key={c.id}>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>
                        {c.image ? <img src={c.image} alt="proof" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'0.25rem'}} /> : <span style={{color:'var(--text-muted)'}}>None</span>}
                      </td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)', fontWeight:500}}>{c.title}</td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>{c.location}</td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>{c.citizen?.name || 'Unknown'}</td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>
                        <select 
                          className="form-control" 
                          style={{padding:'0.3rem', fontSize:'0.85rem', width:'auto'}}
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{padding:'1rem', borderBottom:'1px solid var(--border)'}}>
                        <button className="btn btn-outline" style={{padding:'0.3rem 0.6rem', fontSize:'0.85rem'}} onClick={() => setSelectedComplaint(c)}>View Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedComplaint && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'2rem'}}>
          <div className="card" style={{width:'100%', maxWidth:'600px', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h2 style={{margin:0, color:'var(--primary-dark)'}}>{selectedComplaint.title}</h2>
              <button className="btn btn-outline" style={{padding:'0.3rem 0.6rem'}} onClick={() => setSelectedComplaint(null)}>Close</button>
            </div>
            <p><strong>Category:</strong> {selectedComplaint.category}</p>
            <p style={{margin:'0.5rem 0'}}><strong>Status:</strong> <span className={`badge badge-${selectedComplaint.status === 'in-progress' ? 'progress' : selectedComplaint.status}`}>{selectedComplaint.status}</span></p>
            <p><strong>Assigned To:</strong> {selectedComplaint.assignedTo || 'Unassigned'}</p>
            <div style={{margin:'0.5rem 0', display:'flex', alignItems:'center', gap:'0.5rem'}}>
              <strong>Assign Worker/Team:</strong>
              <select className="form-control" style={{width:'auto', padding:'0.3rem'}} value={selectedComplaint.assignedTo || ''} onChange={(e) => handleAssignTeam(selectedComplaint.id, e.target.value)}>
                <option value="">Unassigned</option>
                <option value="Sanitation Team A">Sanitation Team A</option>
                <option value="Waste Mgmt B">Waste Mgmt B</option>
                <option value="Green Squad C">Green Squad C</option>
              </select>
            </div>
            <p><strong>Reported By:</strong> {selectedComplaint.citizen?.name || 'Unknown'} on {new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {selectedComplaint.location} (Lat: {selectedComplaint.lat}, Lng: {selectedComplaint.lng})</p>
            <hr style={{margin:'1rem 0', borderColor:'var(--border)', borderStyle:'solid', borderBottom:'none'}} />
            <p><strong>Description:</strong></p>
            <p style={{background:'var(--light)', padding:'1rem', borderRadius:'var(--radius-md)', marginTop:'0.5rem'}}>{selectedComplaint.desc}</p>
            {selectedComplaint.image && (
              <div style={{marginTop:'1.5rem'}}>
                <p><strong>Attached Photo Evidence:</strong></p>
                <img src={selectedComplaint.image} alt="Evidence" style={{width:'100%', borderRadius:'var(--radius-md)', marginTop:'0.5rem', boxShadow:'var(--shadow-md)'}} />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

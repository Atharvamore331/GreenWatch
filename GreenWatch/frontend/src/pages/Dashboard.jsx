import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Leaf, LogOut, Plus, MapPin, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [position, setPosition] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', category: '', desc: '', location: '', image: ''
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const u = JSON.parse(userStr);
    setUser(u);
    fetchComplaints(u.id);
    fetchNotifications(u.id);
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async (citizenId) => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      setComplaints(res.data.filter(c => c.citizenId === citizenId || (c.citizen && c.citizen.id === citizenId)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('greenwatch_current_user');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) return alert("Please pin a location on the map!");

    try {
      await axios.post(`${API_URL}/complaints`, {
        ...formData,
        citizenId: user.id,
        lat: position.lat,
        lng: position.lng
      });
      setShowForm(false);
      setFormData({title: '', category: '', desc: '', location: '', image: ''});
      setPosition(null);
      fetchComplaints(user.id);
    } catch (err) {
      alert("Error submitting complaint");
    }
  };

  if (!user) return null;

  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="dashboard-bg">
      <nav className="navbar" style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)'}}>
        <div className="container nav-content">
          <div className="logo" style={{color: 'var(--primary)', fontWeight:'bold', fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <Leaf /> GreenWatch
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
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
          <h2 style={{color: 'white', fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>Citizen Dashboard</h2>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{display:'flex', alignItems:'center', gap:'0.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'}}>
            <Plus size={18}/> Report Issue
          </button>
        </div>

        <div className="grid grid-cols-3" style={{marginBottom:'2rem'}}>
          <div className="card" style={{textAlign:'center', padding:'1.5rem'}}>
            <h3 style={{color:'var(--primary)', fontSize:'2rem'}}>{user.points || 0}</h3>
            <p className="form-label">Reward Points</p>
          </div>
          <div className="card" style={{textAlign:'center', padding:'1.5rem'}}>
            <h3 style={{color:'var(--dark)', fontSize:'2rem'}}>{complaints.length}</h3>
            <p className="form-label">Total Reports</p>
          </div>
          <div className="card" style={{textAlign:'center', padding:'1.5rem'}}>
            <h3 style={{color:'var(--success)', fontSize:'2rem'}}>{resolvedCount}</h3>
            <p className="form-label">Resolved Issues</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="card" style={{marginBottom:'2rem', borderLeft:'5px solid var(--primary)'}}>
            <h3 style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>🔔 Notifications</h3>
            <div style={{maxHeight:'150px', overflowY:'auto'}}>
              {notifications.map(n => (
                <div key={n.id} style={{padding:'0.5rem', borderBottom:'1px solid var(--border)', fontSize:'0.9rem', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: n.isRead ? 400 : 600}}>
                  {n.message} <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>({new Date(n.createdAt).toLocaleTimeString()})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid" style={{gridTemplateColumns: showForm ? '2fr 1fr' : '1fr'}}>
          <div className="card">
            <h3 style={{borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem', marginBottom:'1rem'}}>Your Recent Reports</h3>
            {complaints.length === 0 ? (
              <p style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>No reports yet. Great job!</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} style={{padding:'1rem', border:'1px solid var(--border)', borderRadius:'0.5rem', marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600}}>{c.title}</div>
                    <div style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'0.5rem', display:'flex', gap:'1rem'}}>
                      <span><MapPin size={14}/> {c.location}</span>
                      <span><Clock size={14}/> {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.image && <img src={c.image} alt="proof" style={{marginTop:'0.5rem', maxHeight:'60px', borderRadius:'0.25rem'}} />}
                  </div>
                  <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`}>{c.status}</span>
                </div>
              ))
            )}
          </div>

          {showForm && (
            <div className="card">
              <h3>Report a New Issue</h3>
              <form onSubmit={handleSubmit} style={{marginTop:'1rem'}}>
                <div className="form-group">
                  <label className="form-label">Issue Title</label>
                  <input type="text" className="form-control" required 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="garbage">Illegal garbage dumping</option>
                    <option value="air">Air pollution</option>
                    <option value="water">Water pollution</option>
                    <option value="trees">Illegal tree cutting</option>
                    <option value="noise">Noise pollution</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" required
                    value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Location (Text)</label>
                  <input type="text" className="form-control" required 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Photo Proof (Optional)</label>
                  <input type="file" className="form-control" accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if(file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800;
                            const scale = Math.min(1, MAX_WIDTH / img.width);
                            canvas.width = img.width * scale;
                            canvas.height = img.height * scale;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                            setFormData({...formData, image: compressedBase64});
                          };
                          img.src = reader.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {formData.image && <img src={formData.image} alt="preview" style={{marginTop:'0.5rem', maxHeight:'100px', borderRadius:'0.25rem'}} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Pin Location</label>
                  <div style={{height:'200px', width:'100%', borderRadius:'0.5rem', overflow:'hidden'}}>
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Submit Report</button>
                <button type="button" className="btn btn-outline" style={{width:'100%', marginTop:'0.5rem'}} onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Camera, MapPin, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Note: For now we still simulate Auth via API but store in LocalStorage 
// instead of cookies/JWT for simplicity in the prototype.
const API_URL = 'http://localhost:5000/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('citizen');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('greenwatch_current_user'));
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, { ...formData, role });
        localStorage.setItem('greenwatch_current_user', JSON.stringify(res.data));
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const res = await axios.post(`${API_URL}/auth/register`, formData);
        localStorage.setItem('greenwatch_current_user', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Make sure backend is running.');
    }
  };

  return (
    <div className="auth-bg">
      <nav className="navbar" style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)'}}>
        <div className="container nav-content">
          <div className="logo" style={{color: 'var(--primary)', fontWeight:'bold', fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <Leaf /> GreenWatch
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '3rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="grid grid-cols-2" style={{ alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', color: 'white', lineHeight: '1.2', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Protect Your Environment, Report Issues Instantly.</h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', margin: '1.5rem 0', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
              GreenWatch empowers citizens to report environmental violations like illegal dumping, pollution, and tree cutting to local authorities seamlessly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', flex: 1 }}>
                <Camera size={32} color="var(--primary)" style={{marginBottom:'1rem'}}/>
                <h3>1. Capture</h3>
                <p className="form-label">Take a photo of the issue.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', flex: 1 }}>
                <MapPin size={32} color="var(--primary)" style={{marginBottom:'1rem'}}/>
                <h3>2. Report</h3>
                <p className="form-label">Pin the exact location.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', flex: 1 }}>
                <CheckCircle size={32} color="var(--primary)" style={{marginBottom:'1rem'}}/>
                <h3>3. Resolve</h3>
                <p className="form-label">Authorities take action.</p>
              </div>
            </div>
          </div>
          
          <div style={{ paddingLeft: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button 
                  className={`btn ${role === 'citizen' ? 'btn-primary' : 'btn-outline'}`} 
                  style={{flex: 1, border: role!=='citizen'?'none':''}}
                  onClick={() => {setRole('citizen'); setIsLogin(true); setError('');}}
                >
                  Citizen Login
                </button>
                <button 
                  className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-outline'}`} 
                  style={{flex: 1, border: role!=='admin'?'none':''}}
                  onClick={() => {setRole('admin'); setIsLogin(true); setError('');}}
                >
                  Admin Login
                </button>
              </div>
              
              <h2>{isLogin ? `${role === 'admin' ? 'Admin' : 'Citizen'} Login` : 'Create Citizen Account'}</h2>
              {error && <div style={{color: 'white', background: 'var(--danger)', padding:'0.5rem', borderRadius:'0.5rem', marginBottom:'1rem'}}>{error}</div>}
              
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" required placeholder="John Doe" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" required placeholder="you@example.com"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" required placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>
              
              {role === 'citizen' && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <p className="form-label">
                    {isLogin ? 'New here? ' : 'Already have an account? '}
                    <span style={{fontWeight:600, color:'var(--primary)', cursor:'pointer'}} onClick={() => setIsLogin(!isLogin)}>
                      {isLogin ? 'Create an account' : 'Login instead'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

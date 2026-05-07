import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Ghost, CheckCircle, Clock, MapPin, Users, Wrench, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { createRipple } from './Dashboard';

const API_URL = 'http://localhost:5000/api';

export default function Complaints() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) return navigate('/');
    const u = JSON.parse(userStr);
    setUser(u);
    
    fetchComplaints(u).then(() => {
      setTimeout(() => setIsLoading(false), 400); // UI Polish delay
    });
  }, [navigate]);

  const fetchComplaints = async (u) => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      let data = res.data;
      if (u.role === 'citizen') {
        data = data.filter(c => c.citizenId === u.id || (c.citizen && c.citizen.id === u.id));
      }
      setComplaints(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!c.title.toLowerCase().includes(term) && !c.location.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const getSeverity = (category) => {
    if (['water', 'air'].includes(category)) return 'high';
    if (['trees'].includes(category)) return 'medium';
    return 'low';
  };

  const getAdvancedTimeline = (status, assignedTo) => {
    const step1 = true;
    const step2 = status === 'pending';
    const step3 = !!assignedTo || status !== 'pending';
    const step4 = status === 'in-progress' || status === 'resolved';
    const step5 = status === 'resolved';

    return (
      <div className="timeline-advanced">
        <div className={`timeline-node-wrapper ${step1 ? 'active' : ''}`}><div className={`timeline-node ${step1 ? 'active' : ''}`}><AlertTriangle size={14}/></div><span className="timeline-label">Submitted</span></div>
        <div className={`timeline-node-wrapper ${step2 || step3 ? 'active' : ''}`}><div className={`timeline-node ${step2 || step3 ? 'active' : ''}`}><Search size={14}/></div><span className="timeline-label">Review</span></div>
        <div className={`timeline-node-wrapper ${step3 ? 'active' : ''}`}><div className={`timeline-node ${step3 ? 'active' : ''}`}><Users size={14}/></div><span className="timeline-label">Assigned</span></div>
        <div className={`timeline-node-wrapper ${step4 ? 'active' : ''}`}><div className={`timeline-node ${step4 ? 'active' : ''}`}><Wrench size={14}/></div><span className="timeline-label">Progress</span></div>
        <div className={`timeline-node-wrapper ${step5 ? 'active' : ''}`}><div className={`timeline-node ${step5 ? 'active' : ''}`}><CheckCircle size={14}/></div><span className="timeline-label">Resolved</span></div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className={user.role === 'admin' ? 'admin-bg' : 'dashboard-bg'}>
      <Layout>
        <div className="page-enter" style={{ paddingBottom: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle color="var(--primary)" /> Complaint Database
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Manage and track environmental reports.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-bar" style={{ width: '250px' }}>
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem 1.25rem 0.6rem 2.75rem', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '99px', padding: '0.15rem 0.5rem', height: 'fit-content' }}>
                <Filter size={16} color="var(--text-muted)" style={{ alignSelf: 'center', marginLeft: '0.5rem' }} />
                <select className="form-control" style={{ width: 'auto', border: 'none', background: 'transparent', padding: '0.4rem', fontSize: '0.85rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select className="form-control" style={{ width: 'auto', border: 'none', background: 'transparent', borderLeft: '1px solid var(--border)', borderRadius: 0, padding: '0.4rem', fontSize: '0.85rem' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="garbage">Garbage</option>
                  <option value="air">Air</option>
                  <option value="water">Water</option>
                  <option value="trees">Trees</option>
                  <option value="noise">Noise</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div>
              <div className="skeleton skeleton-box" style={{ height: '120px' }}></div>
              <div className="skeleton skeleton-box" style={{ height: '120px' }}></div>
              <div className="skeleton skeleton-box" style={{ height: '120px' }}></div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="card empty-state">
              <Ghost size={64} color="var(--border)" />
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>No Reports Found</h4>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredComplaints.map(c => {
                const isExpanded = expandedCardId === c.id;
                const severity = getSeverity(c.category);
                
                return (
                  <div key={c.id} className="card complaint-card" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{c.title}</h4>
                          <span className={`badge badge-severity-${severity}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            {severity.toUpperCase()} SEVERITY
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {c.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`}>
                          {c.status.toUpperCase()}
                        </span>
                        <button 
                          className="icon-button" 
                          onClick={() => setExpandedCardId(isExpanded ? null : c.id)}
                          style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem' }}
                        >
                          {isExpanded ? 'Hide Details' : 'View Tracking'} {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className={`expandable-content ${isExpanded ? 'expanded' : ''}`}>
                      <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{c.desc}</p>
                          {c.assignedTo && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <strong>Assigned Team:</strong> {c.assignedTo}
                            </p>
                          )}
                          {user.role === 'admin' && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                              <strong>Reported By:</strong> {c.citizen?.name || 'Citizen'}
                            </p>
                          )}
                        </div>
                        {c.image && (
                          <div style={{ width: '150px' }}>
                            <img src={c.image} alt="proof" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>LIVE TRACKING TIMELINE</h5>
                        {getAdvancedTimeline(c.status, c.assignedTo)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

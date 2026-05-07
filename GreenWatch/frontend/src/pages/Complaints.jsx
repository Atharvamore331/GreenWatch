import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Ghost, CheckCircle, Clock, MapPin, Users, Wrench, ChevronDown, ChevronUp, AlertTriangle, Layers } from 'lucide-react';
import Layout from '../components/Layout';

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
      setTimeout(() => setIsLoading(false), 600);
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

  if (!user) return null;

  return (
    <Layout>
      <div className="fade-in">
        {/* Header & Intelligence Controls */}
        <div className="flex-between mb-8" style={{ flexWrap: 'wrap', gap: 'var(--s-6)' }}>
          <div>
            <h1 className="text-gradient">Intelligence Archive</h1>
            <p style={{ color: 'var(--text-muted)' }}>Historical and active environmental intelligence data.</p>
          </div>
          
          <div className="flex-center" style={{ gap: 'var(--s-4)', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ width: '300px' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search coordinates or titles..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="flex-center" style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-full)', 
              padding: '0.25rem 1rem' 
            }}>
              <Filter size={16} color="var(--text-dim)" style={{ marginRight: '0.5rem' }} />
              <select className="form-control" style={{ width: 'auto', border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <div style={{ height: '20px', width: '1px', background: 'var(--border)', margin: '0 0.75rem' }}></div>
              <select className="form-control" style={{ width: 'auto', border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">Categories</option>
                <option value="garbage">Garbage</option>
                <option value="air">Air</option>
                <option value="water">Water</option>
                <option value="trees">Trees</option>
                <option value="noise">Noise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>)}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="card flex-center" style={{ padding: '5rem', flexDirection: 'column', textAlign: 'center' }}>
            <Ghost size={64} color="var(--border)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-muted)' }}>No Intelligence Data</h3>
            <p style={{ color: 'var(--text-dim)' }}>Adjust filters or deployment criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {filteredComplaints.map(c => {
              const isExpanded = expandedCardId === c.id;
              const severity = getSeverity(c.category);
              
              return (
                <div key={c.id} className={`card ${isExpanded ? '' : 'card-interactive'}`} style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="flex-between">
                    <div className="flex-center" style={{ gap: '1.5rem', justifyContent: 'flex-start' }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: 'var(--radius-md)', 
                        background: 'rgba(255,255,255,0.03)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' 
                      }}>
                        <Layers size={24} color={severity === 'high' ? 'var(--danger)' : severity === 'medium' ? 'var(--warning)' : 'var(--primary)'} />
                      </div>
                      <div>
                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0 }}>{c.title}</h4>
                          <span style={{ 
                            fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.5rem', 
                            borderRadius: '4px', background: severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: severity === 'high' ? 'var(--danger)' : 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {severity.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="flex-center" style={{ gap: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                          <span className="flex-center" style={{ gap: '0.3rem' }}><MapPin size={14} /> {c.location}</span>
                          <span className="flex-center" style={{ gap: '0.3rem' }}><Clock size={14} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-center" style={{ gap: '1.5rem' }}>
                      <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`}>
                        {c.status}
                      </span>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => setExpandedCardId(isExpanded ? null : c.id)}
                        style={{ padding: '0.5rem' }}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '2rem' }}>
                        <div>
                          <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.6 }}>{c.desc}</p>
                          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div>
                              <p className="form-label">Assigned Operatives</p>
                              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                                <Users size={16} color="var(--primary)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.assignedTo || 'Unassigned'}</span>
                              </div>
                            </div>
                            <div>
                              <p className="form-label">Classification</p>
                              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{c.category}</span>
                            </div>
                          </div>
                        </div>
                        {c.image && (
                          <div style={{ position: 'relative' }}>
                            <img src={c.image} alt="Intelligence Proof" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.25rem', borderRadius: '4px' }}>
                              <CheckCircle size={14} color="var(--primary)" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Simplified Tracking Timeline */}
                      <div className="card-glass mt-4" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex-between">
                          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)' }}>INTELLIGENCE TRACKING STATUS</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>LIVE SYNC ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '10px', left: '5%', right: '5%', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                          <div style={{ position: 'absolute', top: '10px', left: '5%', width: c.status === 'resolved' ? '90%' : c.status === 'in-progress' ? '50%' : '0%', height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'width 1s ease' }}></div>
                          {[
                            { label: 'Logged', icon: <Clock size={12} />, active: true },
                            { label: 'Assigned', icon: <Users size={12} />, active: !!c.assignedTo || c.status !== 'pending' },
                            { label: 'Neutralizing', icon: <Wrench size={12} />, active: c.status === 'in-progress' || c.status === 'resolved' },
                            { label: 'Resolved', icon: <CheckCircle size={12} />, active: c.status === 'resolved' }
                          ].map((step, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
                              <div style={{ 
                                width: '22px', height: '22px', borderRadius: '50%', 
                                background: step.active ? 'var(--primary)' : 'var(--bg-base)', 
                                border: '2px solid', borderColor: step.active ? 'var(--primary)' : 'var(--border)',
                                color: step.active ? 'white' : 'var(--text-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {step.icon}
                              </div>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: step.active ? 'var(--text-main)' : 'var(--text-dim)' }}>{step.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

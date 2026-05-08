import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Shield, TrendingUp, AlertCircle, CheckCircle, Download, LayoutGrid, List, MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';
import GoogleMapView from '../components/GoogleMapView';

export default function Admin() {
  const { complaints, updateComplaintStatus, isLoading } = useAppContext();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleStatusChange = async (id, newStatus, currentStatus) => {
    try {
      await updateComplaintStatus(id, newStatus, currentStatus);
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
    link.setAttribute("download", "greenwatch_reports_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    return true;
  });

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const activeTeams = new Set(complaints.filter(c => c.assignedTo).map(c => c.assignedTo)).size;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const totalCount = complaints.length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const stats = [
    { label: 'Total Reports', count: totalCount, color: 'var(--info)', icon: <List size={20} /> },
    { label: 'Pending Critical', count: pendingCount, color: 'var(--warning)', icon: <AlertCircle size={20} /> },
    { label: 'Active Teams', count: activeTeams, color: 'var(--secondary)', icon: <TrendingUp size={20} /> },
    { label: 'Successfully Resolved', count: resolvedCount, color: 'var(--primary)', icon: <CheckCircle size={20} /> },
    { label: 'Resolution Rate', count: `${resolutionRate}%`, color: 'var(--success)', icon: <Shield size={20} /> },
  ];

  // Chart Data Calculations
  const categories = ['garbage', 'water', 'air', 'trees', 'noise'];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length
  }));
  const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count)) || 1;

  const pendingPct = totalCount ? (pendingCount / totalCount) * 100 : 0;
  const progressPct = totalCount ? (inProgressCount / totalCount) * 100 : 0;
  const resolvedPct = totalCount ? (resolvedCount / totalCount) * 100 : 0;

  // Weekly Trends Calculations
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weeklyData = last7Days.map(dateObj => {
    const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateOnly = dateObj.toISOString().split('T')[0]; // simple match for demo
    // We'll just match by day of week for simple visualization to guarantee a spread
    return {
      day: dayStr,
      count: complaints.filter(c => new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === dayStr).length
    };
  });
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count)) || 1;

  return (
    <Layout>
      <div className="fade-in">
        {/* Header Section */}
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Environmental Operations Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>Global Environmental Monitoring System</p>
          </div>
          <button onClick={downloadCSV} className="btn btn-primary">
            <Download size={18} /> Export Reports (CSV)
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }}></div>)
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

        {/* Dynamic Analytics Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s-6)', marginBottom: 'var(--s-8)' }}>
          
          {/* Weekly Activity Trend */}
          <div className="card">
            <h3 className="mb-4">Weekly Submission Trends</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', marginTop: '2rem', gap: '0.5rem' }}>
              {weeklyData.map((data, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{data.count}</div>
                  <div style={{ 
                    width: '100%', 
                    height: `${(data.count / maxWeeklyCount) * 100}px`, 
                    background: i === 6 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 1s ease-out',
                    minHeight: '4px'
                  }}></div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{data.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="card">
            <h3 className="mb-4">Reports by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              {categoryCounts.map(cat => (
                <div key={cat.name} className="flex-center" style={{ gap: '1rem' }}>
                  <div style={{ width: '80px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {cat.name}
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(cat.count / maxCategoryCount) * 100}%`, 
                      height: '100%', 
                      background: 'var(--secondary)',
                      borderRadius: '3px',
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                  <div style={{ width: '20px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600 }}>
                    {cat.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Stacked Progress Bar */}
          <div className="card">
            <h3 className="mb-4">Resolution Status Distribution</h3>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', width: '100%', height: '24px', borderRadius: '12px', overflow: 'hidden', gap: '2px', background: 'rgba(255,255,255,0.05)' }}>
                {totalCount === 0 ? null : (
                  <>
                    <div style={{ width: `${pendingPct}%`, background: 'var(--warning)', transition: 'width 1s ease' }} title="Pending"></div>
                    <div style={{ width: `${progressPct}%`, background: 'var(--secondary)', transition: 'width 1s ease' }} title="In Progress"></div>
                    <div style={{ width: `${resolvedPct}%`, background: 'var(--primary)', transition: 'width 1s ease' }} title="Resolved"></div>
                  </>
                )}
              </div>
              <div className="flex-between mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                  Pending ({Math.round(pendingPct)}%)
                </div>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                  In Progress ({Math.round(progressPct)}%)
                </div>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                  Resolved ({Math.round(resolvedPct)}%)
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
               <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Overall Resolution Efficiency</p>
               <h2 style={{ color: 'var(--success)', fontSize: '2.5rem', margin: 0 }}>{resolutionRate}%</h2>
            </div>
          </div>
        </div>

        {/* Intelligence Heatmap */}
        <div className="card mb-8" style={{ minHeight: '450px' }}>
          <div className="flex-between mb-8">
            <h3 className="flex-center" style={{ gap: '0.75rem' }}>
              <Shield size={20} color="var(--primary)" /> Real-time Activity Map
            </h3>
            <div style={{ display: 'flex', gap: 'var(--s-4)' }}>
              <button className="btn btn-ghost btn-sm"><LayoutGrid size={16} /> Hotspots</button>
              <button className="btn btn-ghost btn-sm"><List size={16} /> Log View</button>
            </div>
          </div>
          <div style={{ height: '340px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <GoogleMapView complaints={filteredComplaints} height="340px" />
          </div>
        </div>

        {/* Incident Management Table */}
        <div className="card">
          <div className="flex-between mb-8">
            <h3>Report Management Database</h3>
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
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Report ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classification</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Coordinates/Address</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resolution Status</th>
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
                        onChange={(e) => handleStatusChange(c.id, e.target.value, c.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">Deploying</option>
                        <option value="resolved">Neutralized</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>View Details</button>
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

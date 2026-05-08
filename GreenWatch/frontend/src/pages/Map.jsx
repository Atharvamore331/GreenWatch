import { Shield, MapPin, AlertCircle, Maximize2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import GoogleMapView from '../components/GoogleMapView';

export default function MapPage() {
  const { complaints, isLoading } = useAppContext();

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

        {/* Map fills remaining height */}
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 0 }}>
          {isLoading ? (
            <div className="skeleton" style={{ width: '100%', height: '100%' }} />
          ) : (
            <GoogleMapView complaints={complaints} height="100%" />
          )}
        </div>

        <div className="flex-center mt-4" style={{ gap: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> <span>Click markers to view details</span>
          </div>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <Shield size={16} /> <span>Environmental Monitoring Active</span>
          </div>
          <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <MapPin size={16} /> <span>{complaints.filter(c => c.lat && c.lng).length} Reports Mapped</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}

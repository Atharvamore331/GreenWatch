import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Complaints from './pages/Complaints';
import Map from './pages/Map';
import Notifications from './pages/Notifications';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';

// Simple protective wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAppContext();
  const userStr = localStorage.getItem('greenwatch_current_user');
  
  if (!userStr && !user) return <Navigate to="/" />;
  
  const currentUser = user || JSON.parse(userStr);
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        {/* Citizen & Common Routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="citizen"><Dashboard /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

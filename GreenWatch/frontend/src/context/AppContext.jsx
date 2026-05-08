import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize User from local storage
  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial data when user changes
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setComplaints([]);
      setNotifications([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [compRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`),
        axios.get(`${API_URL}/notifications/${user.id}`)
      ]);
      setComplaints(compRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setNotifications(notifRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error fetching centralized data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (!user) return;
    try {
      const [compRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`),
        axios.get(`${API_URL}/notifications/${user.id}`)
      ]);
      setComplaints(compRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setNotifications(notifRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error refreshing data', err);
    }
  };

  const submitComplaint = async (newComplaint) => {
    try {
      await axios.post(`${API_URL}/complaints`, newComplaint);
      await refreshAllData();
    } catch (err) {
      console.error('Error submitting complaint', err);
      throw err;
    }
  };

  const updateComplaintStatus = async (id, newStatus, currentStatus) => {
    try {
      await axios.patch(`${API_URL}/complaints/${id}/status`, { status: newStatus });
      await refreshAllData();
      
      // Keep frontend user points in sync with backend logic without needing an extra API call
      if (newStatus === 'resolved' && currentStatus !== 'resolved' && user?.role === 'citizen') {
          const updatedUser = { ...user, points: (user.points || 0) + 10 };
          setUser(updatedUser);
          localStorage.setItem('greenwatch_current_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error updating status", err);
      throw err;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('greenwatch_current_user');
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, logout,
      complaints, refreshAllData, submitComplaint, updateComplaintStatus,
      notifications, markNotificationRead,
      isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import EquipmentList from './components/Equipment/EquipmentList';
import EquipmentDetail from './components/Equipment/EquipmentDetail';
import EquipmentForm from './components/Equipment/EquipmentForm'; // Add this component
import ReservationList from './components/Reservations/ReservationList';
import ReservationForm from './components/Reservations/ReservationForm';
import PendingReservations from './components/Admin/PendingReservations';
import Reports from './components/Reports/Reports';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/equipment" element={
          <ProtectedRoute>
            <Layout>
              <EquipmentList />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* IMPORTANT: Put /equipment/new BEFORE /equipment/:id */}
        <Route path="/equipment/new" element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <EquipmentForm />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id" element={
          <ProtectedRoute>
            <Layout>
              <EquipmentDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reservations" element={
          <ProtectedRoute>
            <Layout>
              <ReservationList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reservations/new" element={
          <ProtectedRoute>
            <Layout>
              <ReservationForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reservations/pending" element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <PendingReservations />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <Reports />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
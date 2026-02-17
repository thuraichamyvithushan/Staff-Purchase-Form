import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PurchaseRequestForm from './pages/PurchaseRequestForm';
import ViewResponses from './pages/ViewResponses';
import ResponseConfirmation from './pages/ResponseConfirmation';
import ManageAdmins from './pages/ManageAdmins';
import ManageProducts from './pages/ManageProducts';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import DashboardLayout from './components/DashboardLayout';
import PendingApproval from './pages/PendingApproval';
import ForgotPassword from './pages/ForgotPassword'; // Assuming ForgotPassword needs to be imported for the new route

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, syncing } = useAuth();

  if (loading || (user && syncing && !role)) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role === 'pending' && window.location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, role, loading, syncing } = useAuth();

  if (loading || (user && syncing && !role)) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (user && role === 'pending' && window.location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user && (role === 'admin' || role === 'representative')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/respond/:token" element={<ResponseConfirmation />} />
          <Route path="/" element={<PublicRoute><PurchaseRequestForm /></PublicRoute>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'representative']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="create-request" element={<PurchaseRequestForm />} />
            <Route path="responses" element={<ViewResponses />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

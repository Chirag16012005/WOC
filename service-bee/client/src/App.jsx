import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Complaint from './pages/Complaint';
import Companies from './pages/Companies';
import MyComplaints from './pages/MyComplaints';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanySettings from './pages/CompanySettings';
import './App.css';

// Protected Route: requires login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

// User-only Route: providers/admins get redirected to their dashboard
const UserOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.role === 'provider' || user.role === 'admin') {
      return <Navigate to="/company-dashboard" replace />;
    }
  }
  return children;
};

// Company-only Route: regular users get redirected to user dashboard
const CompanyOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.role !== 'provider' && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />

          {/* User-only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <UserOnlyRoute>
                <Companies />
              </UserOnlyRoute>
            }
          />
          <Route
            path="/complaint"
            element={
              <UserOnlyRoute>
                <Complaint />
              </UserOnlyRoute>
            }
          />
          <Route
            path="/my-complaints"
            element={
              <UserOnlyRoute>
                <MyComplaints />
              </UserOnlyRoute>
            }
          />

          {/* Shared routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />

          {/* Company-only routes */}
          <Route
            path="/company-dashboard"
            element={
              <CompanyOnlyRoute>
                <CompanyDashboard />
              </CompanyOnlyRoute>
            }
          />
          <Route
            path="/company-settings"
            element={
              <CompanyOnlyRoute>
                <CompanySettings />
              </CompanyOnlyRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


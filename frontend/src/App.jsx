import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import DeckDetail from './pages/DeckDetail';
import FolderDetail from './pages/FolderDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Public Route - redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Main App Routes
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Root - redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/folder/:folderId" 
          element={
            <ProtectedRoute>
              <FolderDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deck/:deckId" 
          element={
            <ProtectedRoute>
              <DeckDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 - catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Navbar from './components/common/NavBar';
import FolderManager from './components/folder/FolderManager';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/folders" element={<FolderManager />} />
            </Route>

            {/* 404 Not Found - optional */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
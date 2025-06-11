// src/App.jsx (Add review routes)
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

// Import page components
import CreateCardPage from './pages/CreateCardPage';
import DeckDetailPage from './pages/DeckDetailPage';
import EditCardPage from './pages/EditCardPage';
import FolderDetailPage from './pages/FolderDetailPage';
import FoldersPage from './pages/FoldersPage';
import FolderStatsPage from './pages/FolderStatsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReviewDeckPage from './pages/ReviewDeckPage';
import ReviewPage from './pages/ReviewPage';
import StatsPage from './pages/StatsPage';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/folders" element={
            <ProtectedRoute>
              <Layout>
                <FoldersPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/folders/:folderId" element={
            <ProtectedRoute>
              <Layout>
                <FolderDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/decks/:deckId" element={
            <ProtectedRoute>
              <Layout>
                <DeckDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/cards/new/:deckId" element={
            <ProtectedRoute>
              <Layout>
                <CreateCardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/cards/edit/:cardId" element={
            <ProtectedRoute>
              <Layout>
                <EditCardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/review" element={
            <ProtectedRoute>
              <Layout>
                <ReviewPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/review/:deckId" element={
            <ProtectedRoute>
              <Layout>
                <ReviewDeckPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/stats" element={
            <ProtectedRoute>
              <Layout>
                <StatsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/stats/folder/:folderId" element={
            <ProtectedRoute>
              <Layout>
                <FolderStatsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
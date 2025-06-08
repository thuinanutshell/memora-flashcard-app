import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import DeckDetail from './components/deck/DeckDetail';
import FolderDetail from './components/folder/FolderDetail';
import Stats from './components/review/Stats';
import Study from './components/review/Study';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function Layout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/folder/:folderId" element={<FolderDetail />} />
                <Route path="/deck/:deckId" element={<DeckDetail />} />
                <Route path="/study" element={<Study />} />
                <Route path="/stats" element={<Stats />} />
              </Route>
            </Route>
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
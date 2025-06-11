// src/components/layout/Layout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-vh-100 bg-light d-flex">
      {/* Mobile Toggle Button */}
      <button 
        className="btn btn-primary position-fixed top-0 start-0 m-3 d-lg-none"
        style={{ zIndex: 1060 }}
        onClick={toggleSidebar}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <main 
        className="flex-grow-1 p-3"
        style={{ 
          marginLeft: window.innerWidth >= 992 ? '250px' : '0',
          paddingTop: window.innerWidth < 992 ? '60px' : '20px' // Account for mobile toggle button
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
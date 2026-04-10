import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Dashboard_Components/Navbar.jsx';
import Footer from '../Dashboard_Components/Footer.jsx';
import LoadingSpinner from '../Loading_UI/LoadingSpinner.jsx';

const Layout = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const mainRef = React.useRef(null);

  // Show loading on route change
  useEffect(() => {
    setNavigating(true);
    
    // Minimum loading time for smooth UX (500ms)
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top when route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const loginPath = ['/login', '/', '/register']; // Define login paths
  const isLoginPage = loginPath.includes(location.pathname);

  // LABEL Path → Menu name mapping
  const pathToMenu = {
    // Admin Routes
    '/home': 'Home',
    '/faculty': 'Faculty',
    '/attendance': 'Attendance',
    '/backup_restore': 'Backup & Restore',
  };

  const activeMenu = pathToMenu[location.pathname] || 'Dashboard';

  if (isLoginPage) {
    // Special layout for login page → full screen center
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar with Navigation */}
      <Navbar
        activeMenu={activeMenu}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 px-1 min-w-0 pt-16">
        {navigating && (
          <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner small={false} label="Loading page..." />
          </div>
        )}
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;

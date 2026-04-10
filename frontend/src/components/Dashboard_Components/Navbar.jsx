import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaHome, FaUsers, FaCog, FaDatabase, FaChevronDown, FaKey, FaSignOutAlt, FaTimes, FaSchool } from 'react-icons/fa';
import ChangePasswordModal from '../Modals/ChangePasswordModal';
import ConfirmationBox from '../Modals/ConfirmationBox';
import Client_Logo from '../Logo/Client_Logo';
import { useUser } from '../context/UserContext';
import historyManager from '../../utils/historyManager.js';
//import { supabase } from '../../supabaseClient';

export default function Navbar({
  activeMenu = '',
  setIsModalOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser(); // ← Get setUser from useUser hook
  const [loading, setLoading] = useState(false);

  const roleMenus = {
    Admin: [
      { name: 'Home', icon: FaHome, path: '/home' },
      { name: 'School', icon: FaSchool, path: '/school' },
      {
        name: 'Settings',
        icon: FaCog,
        submenu: [
          { name: 'Change Password', icon: FaKey, action: 'changePassword' },
          { name: 'Backup & Restore', icon: FaDatabase, path: '/backup_restore' },
        ],
      },
    ],
  };

  const menuItems = roleMenus.Admin || [];

  const toggleSubmenu = (name) => {
    setOpenSubmenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Handle modal state for sidebar z-index
  useEffect(() => {
    const anyModalOpen = isChangePasswordModalOpen || logoutConfirm;
    setIsModalOpen(anyModalOpen);
  }, [
    isChangePasswordModalOpen,
    logoutConfirm,
    setIsModalOpen,
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      // Close desktop submenu when clicking outside
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)) {
        setOpenSubmenu({});
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handlePasswordChange = (data) => {
    console.log('Password data:', data);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      //await supabase.auth.signOut();
      
      // Clear user authentication data
      localStorage.removeItem('user');
      setUser(null);  // Clear user context
      
      // Close the confirmation box immediately
      setLogoutConfirm(false);
      
      // Handle logout history management
      historyManager.handleLogout('/');
      
      // Use React Router to navigate to landing page
      navigate('/');
      
    } catch (err) {
      console.error('Logout error:', err.message);
      // Clear user data even on error
      localStorage.removeItem('user');
      setUser(null);
      setLogoutConfirm(false);
      navigate('/');
    } finally {
      // Add delay to show loading state
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <nav className="w-full bg-white shadow-lg px-4 sm:px-6 md:px-8 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo */}
      <div className="shrink-0">
        <Link to="/home" className="flex items-center gap-2">
          <Client_Logo size={40} />
          <span className="text-lg font-bold text-gray-800">
            NUVELCO
          </span>
        </Link>
      </div>

      {/* Center: Navigation Menu */}
      <div className="flex-1 flex items-center justify-center" ref={desktopMenuRef}>
        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      openSubmenu[item.name] || item.submenu?.some(sub => location.pathname === sub.path)
                        ? 'bg-[#188b3e]/10 text-[#188b3e]'
                        : 'text-gray-700 hover:bg-[#188b3e]/10'
                    }`}
                  >
                    <span className="text-lg"><item.icon /></span>
                    <span>{item.name}</span>
                    <FaChevronDown className={`text-xs transition-transform ${openSubmenu[item.name] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSubmenu[item.name] && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      {item.submenu.map((sub, subIdx) => (
                        <div key={subIdx}>
                          {sub.submenu ? (
                            <div>
                              <button
                                onClick={() => toggleSubmenu(`${item.name}-${sub.name}`)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10"
                              >
                                <span className="flex items-center gap-2">
                                  <span><sub.icon /></span>
                                  {sub.name}
                                </span>
                                <FaChevronDown className={`text-xs transition-transform ${openSubmenu[`${item.name}-${sub.name}`] ? 'rotate-180' : ''}`} />
                              </button>
                              {openSubmenu[`${item.name}-${sub.name}`] && (
                                <div className="pl-4">
                                  {sub.submenu.map((nested, nestedIdx) => (
                                    <Link
                                      key={nestedIdx}
                                      to={nested.path}
                                      onClick={() => setOpenSubmenu({})}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10 rounded"
                                    >
                                      <span><nested.icon /></span>
                                      {nested.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : sub.action === 'changePassword' ? (
                            <button
                              onClick={() => {
                                setIsChangePasswordModalOpen(true);
                                setOpenSubmenu({});
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10 w-full text-left"
                            >
                              <span><sub.icon /></span>
                              {sub.name}
                            </button>
                          ) : (
                            <Link
                              to={sub.path}
                              onClick={() => setOpenSubmenu({})}
                              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                location.pathname === sub.path
                                  ? 'bg-[#188b3e]/10 text-[#188b3e]'
                                  : 'text-gray-700 hover:bg-[#188b3e]/10'
                              }`}
                            >
                              <span><sub.icon /></span>
                              {sub.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setOpenSubmenu({})}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path ? 'bg-[#188b3e]/10 text-[#188b3e]' : 'text-gray-700 hover:bg-[#188b3e]/10'
                  }`}
                >
                  <span className="text-lg"><item.icon /></span>
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div ref={menuRef} className="fixed top-14 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 lg:hidden max-h-[80vh] overflow-y-auto">
            {menuItems.map((item, idx) => (
              <div key={idx}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium ${
                        openSubmenu[item.name] || item.submenu?.some(sub => location.pathname === sub.path)
                          ? 'bg-[#188b3e]/10 text-[#188b3e]'
                          : 'text-gray-700 hover:bg-[#188b3e]/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg"><item.icon /></span>
                        {item.name}
                      </span>
                      <FaChevronDown className={`text-xs transition-transform ${openSubmenu[item.name] ? 'rotate-180' : ''}`} />
                    </button>
                    {openSubmenu[item.name] && (
                      <div className="pl-4">
                        {item.submenu.map((sub, subIdx) => (
                          <div key={subIdx}>
                            {sub.submenu ? (
                              <div>
                                <button
                                  onClick={() => toggleSubmenu(`${item.name}-${sub.name}`)}
                                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10"
                                >
                                  <span className="flex items-center gap-2">
                                    <span><sub.icon /></span>
                                    {sub.name}
                                  </span>
                                  <FaChevronDown className={`text-xs transition-transform ${openSubmenu[`${item.name}-${sub.name}`] ? 'rotate-180' : ''}`} />
                                </button>
                                {openSubmenu[`${item.name}-${sub.name}`] && (
                                  <div className="pl-4">
                                    {sub.submenu.map((nested, nestedIdx) => (
                                      <Link
                                        key={nestedIdx}
                                        to={nested.path}
                                        onClick={() => {
                                          setMenuOpen(false);
                                          setOpenSubmenu({});
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10"
                                      >
                                        <span><nested.icon /></span>
                                        {nested.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : sub.action === 'changePassword' ? (
                              <button
                                onClick={() => {
                                  setIsChangePasswordModalOpen(true);
                                  setMenuOpen(false);
                                  setOpenSubmenu({});
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10 w-full text-left"
                              >
                                <span><sub.icon /></span>
                                {sub.name}
                              </button>
                            ) : (
                              <Link
                                to={sub.path}
                                onClick={() => {
                                  setMenuOpen(false);
                                  setOpenSubmenu({});
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                  location.pathname === sub.path
                                    ? 'bg-[#188b3e]/10 text-[#188b3e]'
                                    : 'text-gray-600 hover:bg-[#188b3e]/10'
                                }`}
                              >
                                <span><sub.icon /></span>
                                {sub.name}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                      location.pathname === item.path ? 'bg-[#188b3e]/10 text-[#188b3e]' : 'text-gray-700 hover:bg-[#188b3e]/10'
                    }`}
                  >
                    <span className="text-lg"><item.icon /></span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {/* Logout button - separate in mobile menu */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <span className="text-lg"><FaSignOutAlt /></span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Right: Hamburger Menu (small screen) / Logout (large screen) */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Mobile Menu Button - visible on small screens */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-full text-gray-700 text-xl focus:outline-none hover:bg-gray-200 transition-colors cursor-pointer"
          title={menuOpen ? 'Close menu' : 'Show menu items'}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logout Button - visible on large screens */}
        <button
          onClick={() => setLogoutConfirm(true)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          title="Logout"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <ConfirmationBox
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          label={'Logout'}
          disabled={loading}
          isLoading={loading}
          loadingText={'Logging out...'}
          onConfirm={async () => {
            await handleLogout();
          }}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}
    </nav>
  );
}

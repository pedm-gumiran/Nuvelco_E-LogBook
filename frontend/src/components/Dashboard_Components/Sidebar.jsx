import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaClipboardCheck,
  FaUpload,
  FaBook,
  FaThLarge,
  FaGraduationCap,
  FaCog,
  FaFileArchive,
  FaDatabase,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaBox,
  FaBoxes,
  FaExchangeAlt,
  FaHistory,
  FaUndo,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
} from 'react-icons/fa';
import Tooltip from '../utility/Tooltip';
import { useUser } from '../context/UserContext';

export default function Sidebar({ isMobileOpen, onCloseMobile, isModalOpen }) {
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed on larger screens
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [hoveredSubIndex, setHoveredSubIndex] = useState({});
  const [hoveredCollapseBtn, setHoveredCollapseBtn] = useState(false); // for collapse button tooltip

  const location = useLocation();
  const { user } = useUser();
  const { role } = user || {};

  // Debug: Log user and menu items
  console.log('User:', user);
  console.log('Role:', role);

  // Auto open/close sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false); // Expanded on mobile/tablet
      } else {
        setCollapsed(true); // Collapsed on desktop (larger screens)
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Base role menus
  const roleMenus = {
    Admin: [
      { name: 'Home', icon: <FaHome />, path: '/home_admin' },
      
      {
        name: 'Create Transaction',
        icon: <FaExchangeAlt />,
        path: '/create_transaction',
      },
      
      {
        name: 'Inventory',
        icon: <FaBoxes />,
        textTooltip: 'Please expand to see inventory options',
        submenu: [
          {
            name: 'Consumable Products',
            icon: <FaBox />,
            path: '/consumable_products',
          },
          {
            name: 'Non-consumable Products',
            icon: <FaBoxes />,
            path: '/non_consumable_products',
          },
        ],
      },
      
      {
        name: 'Settings',
        icon: <FaCog />,
        textTooltip: 'Please expand to see the settings',
        submenu: [
          {
            name: 'Audit',
            icon: <FaHistory />,
            textTooltip: 'Please expand to see audit options',
            submenu: [
              {
                name: 'Transaction',
                icon: <FaClipboardCheck />,
                path: '/transaction_audit',
              },
              {
                name: 'Equipment Return',
                icon: <FaUndo />,
                path: '/equipment_return',
              },
            ],
          },
          {
            name: 'Backup & Restore',
            icon: <FaDatabase />,
            path: '/backup_restore',
          },
        ],
      },
    ],
  };


  // Final menu based on role
  const menuItems = roleMenus.Admin || []; // Default to Admin menu for now

  // Debug: Log final menu items
  console.log('Final Menu Items:', menuItems);

  const toggleSubmenu = (name) => {
    setOpenSubmenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (!collapsed) setOpenSubmenu({});
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out shadow-lg z-50
          ${collapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isModalOpen ? 'lg:z-0' : 'lg:z-50'}
        `}
      >
        {/* Logo */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center h-16 border-b border-base-200">
          {collapsed ? (
            <img src="/reims-logo-icon.svg" alt="REIMS" className="w-8 h-8" />
          ) : (
            <div className="flex items-center gap-3">
              <img src="/reims-logo-icon.svg" alt="REIMS" className="w-8 h-8" />
              <span className="text-xl font-extrabold text-white tracking-wide">
                RE<span className="text-yellow-400">IMS</span>
              </span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-1 py-4 overflow-visible">
          <ul className="space-y-2">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item, idx) => {
                const isActive = item.path === location.pathname;
                const tooltipText =
                  collapsed && item.textTooltip ? item.textTooltip : item.name;

                return (
                  <li key={idx} className="relative">
                    <Tooltip
                      text={tooltipText}
                      show={hoveredIndex === idx && collapsed}
                    >
                      <div className="flex flex-col w-full rounded-lg transition-colors text-xs">
                        <div
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className={`flex rounded-md w-full py-3 px-4 items-center justify-between cursor-pointer transition-colors
                            ${isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}
                            ${hoveredIndex === idx ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white' : ''}
                            ${collapsed ? 'justify-center' : 'justify-between gap-3'}
                          `}
                          onClick={() => {
  if (collapsed) {
    setCollapsed(false); // Expand sidebar if collapsed
  } else if (item.submenu) {
    toggleSubmenu(item.name); // Toggle submenu if already expanded
  }
}}
                        >
                          {item.path && !item.submenu ? (
                            <Link
                              to={item.path}
                              className="flex items-center gap-3 w-full"
                              onClick={(e) => {
                                if (collapsed) {
                                  e.preventDefault(); // Prevent navigation if collapsed
                                  setCollapsed(false); // Expand sidebar instead
                                } else {
                                  if (window.innerWidth < 1024) onCloseMobile();
                                }
                              }}
                            >
                              <span className="text-lg">{item.icon}</span>
                              {!collapsed && (
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <span className="text-lg">{item.icon}</span>
                              {!collapsed && (
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
                              )}
                            </div>
                          )}

                          {!collapsed && item.submenu && (
                            <span
                              className={`transition-transform duration-500 ease-in-out ${
                                openSubmenu[item.name] ? 'rotate-180' : ''
                              }`}
                            >
                              <FaChevronDown />
                            </span>
                          )}
                        </div>

                      {item.submenu && openSubmenu[item.name] && (
                        <ul className="pl-10 space-y-1">
                          {item.submenu.map((sub, subIdx) => {
                            const isSubActive = sub.path === location.pathname;
                            return (
                              <li
                                key={subIdx}
                                onMouseEnter={() =>
                                  setHoveredSubIndex((prev) => ({
                                    ...prev,
                                    [item.name]: subIdx,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setHoveredSubIndex((prev) => ({
                                    ...prev,
                                    [item.name]: null,
                                  }))
                                }
                                className={`flex flex-col w-full rounded cursor-pointer transition-colors
                                  ${isSubActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}
                                  ${
                                    hoveredSubIndex[item.name] === subIdx
                                      ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white'
                                      : ''
                                  }
                                `}
                              >
                                <div
                                  className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer transition-colors w-full
                                    ${isSubActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}
                                    ${
                                      hoveredSubIndex[item.name] === subIdx
                                        ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white'
                                        : ''
                                    }
                                  `}
                                  onClick={() => {
  if (collapsed) {
    setCollapsed(false); // Expand sidebar if collapsed
  } else {
    sub.submenu && toggleSubmenu(`${item.name}-${sub.name}`);
  }
}}
                                >
                                  {sub.path && !sub.submenu ? (
                                    <Link
                                      to={sub.path}
                                      className="flex items-center gap-2 w-full"
                                      onClick={(e) => {
                                        if (collapsed) {
                                          e.preventDefault(); // Prevent navigation if collapsed
                                          setCollapsed(false); // Expand sidebar instead
                                        } else {
                                          setOpenSubmenu((prev) => ({
                                            ...prev,
                                            [item.name]: false,
                                          }));
                                          if (window.innerWidth < 1024) {
                                            onCloseMobile();
                                          }
                                        }
                                      }}
                                    >
                                      <span className="text-lg">{sub.icon}</span>
                                      <span className="text-sm">{sub.name}</span>
                                    </Link>
                                  ) : (
                                    <div className="flex items-center gap-2 w-full">
                                      <span className="text-lg">{sub.icon}</span>
                                      <span className="text-sm">{sub.name}</span>
                                    </div>
                                  )}

                                  {!collapsed && sub.submenu && (
                                    <span
                                      className={`transition-transform duration-500 ease-in-out ${
                                        openSubmenu[`${item.name}-${sub.name}`] ? 'rotate-180' : ''
                                      }`}
                                    >
                                      <FaChevronDown />
                                    </span>
                                  )}
                                </div>

                                {!collapsed && sub.submenu && openSubmenu[`${item.name}-${sub.name}`] && (
                                  <ul className="pl-8 space-y-1 mt-1">
                                    {sub.submenu.map((nestedSub, nestedIdx) => {
                                      const isNestedActive = nestedSub.path === location.pathname;
                                      return (
                                        <li
                                          key={nestedIdx}
                                          className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors
                                            ${isNestedActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}
                                            hover:bg-gradient-to-r hover:from-green-500/80 hover:to-emerald-600/80 hover:text-white
                                          `}
                                        >
                                          {nestedSub.path ? (
                                            <Link
                                              to={nestedSub.path}
                                              className="flex items-center gap-2 w-full"
                                              onClick={(e) => {
                                              if (collapsed) {
                                                e.preventDefault(); // Prevent navigation if collapsed
                                                setCollapsed(false); // Expand sidebar instead
                                              } else {
                                                setOpenSubmenu((prev) => ({
                                                  ...prev,
                                                  [item.name]: false,
                                                  [`${item.name}-${sub.name}`]: false,
                                                }));
                                                if (window.innerWidth < 1024) {
                                                  onCloseMobile();
                                                }
                                              }
                                            }}
                                            >
                                              <span className="text-lg">{nestedSub.icon}</span>
                                              <span className="text-sm">{nestedSub.name}</span>
                                            </Link>
                                          ) : (
                                            <>
                                              <span className="text-lg">{nestedSub.icon}</span>
                                              <span className="text-sm">{nestedSub.name}</span>
                                            </>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </Tooltip>
                </li>
              );
            })
            ) : (
              <li className="px-4 py-2 text-gray-500 text-sm">
                No menu items available
              </li>
            )}
          </ul>
        </nav>

        {/* Expand/Collapse Button - Hidden on small screens */}
        <div
          className="hidden lg:block p-4 pt-2 border-t border-base-200/50"
          onMouseEnter={() => setHoveredCollapseBtn(true)}
          onMouseLeave={() => setHoveredCollapseBtn(false)}
        >
          <Tooltip
            text={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            show={hoveredCollapseBtn && collapsed}
          >
            <button
              onClick={toggleSidebar}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="group flex items-center justify-center w-full py-2.5 px-3 rounded-lg border border-green-300/50 hover:border-green-500/40 bg-white/50 hover:bg-white/80 shadow-sm hover:shadow-xs transition-all duration-200 ease-in-out cursor-pointer"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                {collapsed ? (
                  <FaAngleDoubleRight className="text-xs text-green-600/70 group-hover:text-green-600" />
                ) : (
                  <FaAngleDoubleLeft className="text-xs text-green-600/70 group-hover:text-green-600" />
                )}
              </div>

              {!collapsed && (
                <span className="ml-2 text-xs font-medium text-gray-800 group-hover:text-gray-800 transition-colors">
                  {collapsed ? 'Expand' : 'Collapse'}
                </span>
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}

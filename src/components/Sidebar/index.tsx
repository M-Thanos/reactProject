// import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '../../images/logo/logo.svg';
import { 
  FaHome, 
  FaArrowLeft, 
  FaUsers, 
  FaUserTie, 
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}
const Sidebar = ({ sidebarOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { userData } = useAuth();

  const SidebarMenu = [
    {
      name: 'لوحة التحكم',
      path: '/',
      icon: <FaHome />,
    },
    {
      name: 'منطقة العملاء',
      path: '/client',
      icon: <FaEye />,
    },
    // Admin only items
    ...(userData?.role === 'admin' ? [
      {
        name: 'إدارة المستخدمين',
        path: '/users',
        icon: <FaUsers />,
      },
      {
        name: 'قائمة المسوقين',
        path: '/marketers-list',
        icon: <FaUserTie />,
      },
    ] : []),
  ];

  // close if the esc key is pressed

  return (
    <aside
      className={`absolute left-0 top-0 z-99999 flex h-screen w-72.5 flex-col overflow-y-hidden dark:bg-meta-4 bg-white duration-300 ease-linear  lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button onClick={toggleSidebar} className="block lg:hidden">
          <FaArrowLeft />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-3">
              {SidebarMenu.map((item, index) => (
                <li
                  key={index}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <NavLink
                    to={item.path}
                    className={`relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-800 dark:text-bodydark1 duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 ${
                      item.path === location.pathname
                        ? 'bg-gray-100 dark:bg-meta-4'
                        : ''
                    }`}
                  >
                    {item.icon}
                    <span className="whitespace-nowrap">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

        </nav>
        <Outlet />
      </div>
    </aside>
  );
};

export default Sidebar;


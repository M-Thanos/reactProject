import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { Outlet } from 'react-router-dom';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('sidebar', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} /> */}

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main>
            <div className="mx-auto max-w-screen-2xl p-2 md:p-3 2xl:p-5 dark:bg-gray-900 bg-white">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;

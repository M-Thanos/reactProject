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
          <main className="flex-1">
            <div className="mx-auto max-w-screen-2xl p-2 sm:p-3 md:p-4 lg:p-5 2xl:p-6 dark:bg-gray-900 bg-white h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;

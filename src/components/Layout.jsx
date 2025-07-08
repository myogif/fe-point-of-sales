import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';

const Layout = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  // The POS page has its own layout
  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out`}
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

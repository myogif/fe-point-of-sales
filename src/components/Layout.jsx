import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';

const Layout = () => {
  const { isCollapsed, isSidebarOpen, toggleSidebar } = useSidebar();
  const location = useLocation();

  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <header className="lg:hidden flex items-center justify-between bg-white p-4 border-b">
          <button onClick={toggleSidebar} className="text-gray-500">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Dashboard</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

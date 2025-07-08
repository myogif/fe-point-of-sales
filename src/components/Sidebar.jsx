import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ShoppingBag,
  ChevronLeft,
  LogOut,
  List,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse } = useSidebar();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'Sales (POS)', path: '/' },
    { icon: ShoppingBag, label: 'Purchases', path: '/purchases' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: List, label: 'Categories', path: '/categories' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: CreditCard, label: 'Credit', path: '/credit' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">POS</h1>
          </div>
        )}
        <button onClick={toggleCollapse} className="hidden lg:block text-gray-500 hover:text-gray-800">
          <ChevronLeft className={`w-6 h-6 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="mt-4 flex-1">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-gray-200">
        <div className="p-2 rounded-lg hover:bg-gray-100">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <img
                src={`https://i.pravatar.cc/150?u=${user?.email}`}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-800">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                </div>
              )}
            </div>
        </div>
        <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center mt-2 py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 font-medium">Settings</span>}
        </NavLink>
        <button
          onClick={logout}
          className={`w-full flex items-center mt-2 py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

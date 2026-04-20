import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, Activity, MapPin, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { isAuthenticated, logout, doctor } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Citas', path: '/citas', icon: Calendar },
    { name: 'Consultas', path: '/consultas', icon: FileText },
    { name: 'Expedientes', path: '/expedientes', icon: FileText },
    { name: 'Intervenciones', path: '/intervenciones', icon: Activity },
    { name: 'Consultorio', path: '/consultorio', icon: MapPin },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">Hospital XYZ</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {/* CORRECCIÓN: Agregamos ?. a nombre y un fallback 'D' */}
              {doctor?.nombre?.charAt(0) || 'D'}
            </div>
            <div className="ml-3 overflow-hidden">
              {/* CORRECCIÓN: Fallbacks para evitar textos vacíos o undefined */}
              <p className="text-sm font-medium text-gray-900 truncate">
                {doctor?.nombre || 'Doctor'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {doctor?.especialidad || 'Sin especialidad'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Newspaper, Globe, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-xs text-gray-500">You must be logged in as an Administrator to access this dashboard.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Overview Analytics', icon: LayoutDashboard, exact: true },
    { path: '/admin/upload', label: 'Upload Newspaper PDF', icon: UploadCloud },
    { path: '/admin/newspapers', label: 'Manage Newspapers', icon: Newspaper },
    { path: '/admin/languages', label: 'Dynamic Languages', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 font-extrabold text-gray-900 text-base">
              <Shield className="w-5 h-5 text-brand-600" />
              <span>Admin Console</span>
            </div>
            <Link to="/" className="text-xs text-gray-400 hover:text-brand-600" title="Exit to Site">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-3">
          <div className="text-xs font-semibold text-gray-700">
            {user.name}
            <span className="block text-[10px] text-gray-400 font-normal">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}

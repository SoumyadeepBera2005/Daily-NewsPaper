import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe, BookOpen, Bookmark, History, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import LoginModal from './LoginModal';
import SearchDrawer from './SearchDrawer';

export default function Header() {
  const { user, logout } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    apiFetch('/languages')
      .then(data => setLanguages(data))
      .catch(err => console.error('Failed to load languages', err));
  }, []);

  const handleLangSelect = (langCode) => {
    setShowLangMenu(false);
    setMobileMenuOpen(false);
    navigate(`/newspapers?languageCode=${langCode}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 text-brand-600 font-bold text-xl tracking-tight">
              <img src="/logo.svg" alt="Daily News Hub Logo" className="w-9 h-9 rounded-xl shadow-md shadow-brand-500/20 object-cover" />
              <div>
                <span className="text-gray-900 font-extrabold">Daily News</span>
                <span className="text-brand-600 ml-1">Hub</span>
              </div>
            </Link>

            {/* Center/Right Nav links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              <Link
                to="/newspapers"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/newspapers' ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Newspapers
              </Link>

              {/* Dynamic Languages Dropdown (Section 4 A & 35) */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span>Languages</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">{languages.length}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Select Language
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {languages.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => handleLangSelect(lang.code)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 flex items-center justify-between transition-colors"
                        >
                          <span className="font-medium">{lang.native_name}</span>
                          <span className="text-xs text-gray-400 font-normal">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* UPSC Dedicated Link */}
              <Link
                to="/upsc"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/upsc')
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>UPSC / IAS</span>
              </Link>
            </nav>

            {/* Right: Search, Auth & Admin Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setShowSearchDrawer(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
                title="Search Newspapers"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="hidden lg:inline text-xs text-gray-500">Search...</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/bookmarks"
                    className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Saved Bookmarks"
                  >
                    <Bookmark className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/history"
                    className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Reading History"
                  >
                    <History className="w-5 h-5" />
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <div className="h-6 w-px bg-gray-200 mx-1"></div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{user.name.split(' ')[0]}</span>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setShowSearchDrawer(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/newspapers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              All Newspapers
            </Link>
            <Link
              to="/upsc"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-700 bg-amber-50"
            >
              UPSC / IAS Preparation
            </Link>

            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
                Languages
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangSelect(lang.code)}
                    className="text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-brand-50 rounded"
                  >
                    {lang.native_name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-3">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-brand-600">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="text-xs text-red-600 font-medium">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                  className="w-full py-2 bg-brand-600 text-white rounded-lg text-center text-sm font-semibold"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login / Auth Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Search Slide-over Drawer */}
      {showSearchDrawer && <SearchDrawer onClose={() => setShowSearchDrawer(false)} languages={languages} />}
    </>
  );
}

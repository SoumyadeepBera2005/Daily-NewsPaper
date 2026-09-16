import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Newspapers from './pages/Newspapers';
import NewspaperDetail from './pages/NewspaperDetail';
import UPSC from './pages/UPSC';
import Bookmarks from './pages/Bookmarks';
import History from './pages/History';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UploadNewspaper from './pages/admin/UploadNewspaper';
import ManageNewspapers from './pages/admin/ManageNewspapers';
import ManageLanguages from './pages/admin/ManageLanguages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1">
            <Routes>
              {/* Public Reader Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/newspapers" element={<Newspapers />} />
              <Route path="/newspapers/:id" element={<NewspaperDetail />} />
              <Route path="/upsc" element={<UPSC />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/history" element={<History />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="upload" element={<UploadNewspaper />} />
                <Route path="newspapers" element={<ManageNewspapers />} />
                <Route path="languages" element={<ManageLanguages />} />
              </Route>
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle2, XCircle, Trash, CheckSquare, Square, AlertTriangle, Shield } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ManageNewspapers() {
  const { login } = useAuth();
  const [newspapers, setNewspapers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetchNewspapers();
  }, [search]);

  const fetchNewspapers = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await apiFetch(`/newspapers/search?q=${search}&limit=100`);
      setNewspapers(res.newspapers || []);
      // Filter out selected IDs that are no longer present
      setSelectedIds(prev => prev.filter(id => (res.newspapers || []).some(n => n.id === id)));
    } catch (err) {
      console.error(err);
      if (err.message.includes('token') || err.message.includes('Access')) {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoginLoading(true);
    setAuthError('');
    try {
      await login('admin@dailynewshub.com', 'admin123');
      fetchNewspapers();
    } catch (err) {
      setAuthError('Login failed: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const isAllSelected = newspapers.length > 0 && selectedIds.length === newspapers.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(newspapers.map(p => p.id));
    }
  };

  const handleRowSelectToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await apiFetch(`/admin/newspapers/${id}/publish`, { method: 'PATCH' });
      setNewspapers(prev => prev.map(p => p.id === id ? { ...p, status: res.status } : p));
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDeleteSingle = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      await apiFetch(`/admin/newspapers/${id}`, { method: 'DELETE' });
      setNewspapers(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      alert('Failed to delete edition: ' + err.message);
    }
  };

  // Bulk Delete Selected Newspapers
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`⚠️ Are you sure you want to delete ${selectedIds.length} selected newspaper(s)? This will delete their PDF files and database records permanently.`)) {
      return;
    }

    setDeleting(true);
    try {
      await apiFetch('/admin/newspapers/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      });

      setNewspapers(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to execute bulk delete: ' + err.message);
      if (err.message.includes('token') || err.message.includes('Access')) {
        setAuthError(err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Delete ALL Newspapers
  const handleDeleteAll = async () => {
    if (newspapers.length === 0) return;

    if (!window.confirm(`🔥 DANGER: Are you sure you want to DELETE ALL ${newspapers.length} newspaper editions in the system? ALL PDF files will be deleted permanently.`)) {
      return;
    }

    setDeleting(true);
    try {
      await apiFetch('/admin/newspapers/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: 'ALL' })
      });

      setNewspapers([]);
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to delete all newspapers: ' + err.message);
      if (err.message.includes('token') || err.message.includes('Access')) {
        setAuthError(err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Manage Newspapers</h1>
          <p className="text-xs text-gray-500 mt-1">Publish, unpublish, or bulk delete newspaper editions</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {authError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={handleQuickAdminLogin}
            disabled={loginLoading}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shrink-0 flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{loginLoading ? 'Logging in...' : 'Log In as Admin'}</span>
          </button>
        </div>
      )}

      {/* Bulk Action Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAllToggle}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 transition-colors"
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4 text-gray-400" />}
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>

          <span className="text-xs text-gray-500 font-medium">
            Selected <strong className="text-brand-600 font-bold">{selectedIds.length}</strong> of {newspapers.length} editions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete Selected Button */}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0 || deleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:hover:bg-rose-50 border border-rose-200 rounded-xl font-bold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>

          {/* Delete ALL Button */}
          <button
            onClick={handleDeleteAll}
            disabled={newspapers.length === 0 || deleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 rounded-xl font-bold text-xs shadow-sm transition-colors"
          >
            <Trash className="w-4 h-4" />
            <span>Delete All ({newspapers.length})</span>
          </button>
        </div>
      </div>

      {/* Table Component */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Edition Title</th>
                <th className="p-4">Language</th>
                <th className="p-4">Category</th>
                <th className="p-4">Edition Date</th>
                <th className="p-4">Publisher</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">Loading newspapers...</td>
                </tr>
              ) : newspapers.length > 0 ? (
                newspapers.map(paper => {
                  const isSelected = selectedIds.includes(paper.id);
                  return (
                    <tr 
                      key={paper.id} 
                      className={`transition-colors ${isSelected ? 'bg-brand-50/40' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelectToggle(paper.id)}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-gray-900">{paper.title}</td>
                      <td className="p-4 text-gray-600 font-medium">{paper.language_native_name || paper.language_name}</td>
                      <td className="p-4 text-gray-600">{paper.category_name}</td>
                      <td className="p-4 text-gray-500">{paper.edition_date}</td>
                      <td className="p-4 text-gray-500">{paper.publisher}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(paper.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] transition-colors ${
                            paper.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {paper.status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{paper.status}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteSingle(paper.id, paper.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Edition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No newspaper editions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

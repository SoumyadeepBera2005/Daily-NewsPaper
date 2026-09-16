import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function ManageLanguages() {
  const [languages, setLanguages] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/languages?all=true');
      setLanguages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code || !nativeName) return;

    setError('');
    setSubmitting(true);
    try {
      const newLang = await apiFetch('/admin/languages', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code,
          native_name: nativeName,
          display_order: parseInt(displayOrder, 10) || 0
        })
      });

      setLanguages(prev => [...prev, newLang]);
      setName('');
      setCode('');
      setNativeName('');
      setDisplayOrder(languages.length + 1);
    } catch (err) {
      setError(err.message || 'Failed to create language');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (lang) => {
    try {
      const updated = await apiFetch(`/admin/languages/${lang.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !lang.is_active })
      });
      setLanguages(prev => prev.map(l => l.id === lang.id ? updated : l));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this language?')) return;
    try {
      await apiFetch(`/admin/languages/${id}`, { method: 'DELETE' });
      setLanguages(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete language');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Dynamic Language System</h1>
        <p className="text-xs text-gray-500 mt-1">Configure active newspaper languages (Section 4 A requirement)</p>
      </div>

      {/* Add New Language Card */}
      <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-600" />
          <span>Add New Language</span>
        </h3>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Language Name (e.g. Assamese)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="text"
            required
            placeholder="Code (e.g. as)"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="text"
            required
            placeholder="Native Name (e.g. অসমীয়া)"
            value={nativeName}
            onChange={e => setNativeName(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            disabled={submitting}
            className="py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Language'}
          </button>
        </div>
      </form>

      {/* Languages Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Native Name</th>
                <th className="p-4">English Name</th>
                <th className="p-4">ISO Code</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Loading languages...</td>
                </tr>
              ) : languages.map(lang => (
                <tr key={lang.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-gray-900">{lang.native_name}</td>
                  <td className="p-4 text-gray-600">{lang.name}</td>
                  <td className="p-4 font-mono text-gray-500">{lang.code}</td>
                  <td className="p-4 text-gray-500">{lang.display_order}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(lang)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        lang.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {lang.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{lang.is_active ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(lang.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                      title="Delete Language"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

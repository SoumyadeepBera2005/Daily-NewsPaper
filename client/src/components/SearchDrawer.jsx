import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, RotateCcw, ArrowRight } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function SearchDrawer({ onClose, languages = [] }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Form state
  const [q, setQ] = useState('');
  const [languageCode, setLanguageCode] = useState('all');
  const [category, setCategory] = useState('all');
  const [newspaper, setNewspaper] = useState('');
  const [date, setDate] = useState('');
  const [publisher, setPublisher] = useState('');
  const [sort, setSort] = useState('newest');

  // Preview results count state
  const [resultCount, setResultCount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/categories')
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  // Fetch count preview on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (languageCode !== 'all') params.append('languageCode', languageCode);
      if (category !== 'all') params.append('category', category);
      if (newspaper) params.append('newspaper', newspaper);
      if (date) params.append('date', date);
      if (publisher) params.append('publisher', publisher);
      params.append('sort', sort);

      apiFetch(`/newspapers/search?${params.toString()}`)
        .then(res => setResultCount(res.pagination ? res.pagination.total : 0))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [q, languageCode, category, newspaper, date, publisher, sort]);

  const handleApplySearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (languageCode !== 'all') params.append('languageCode', languageCode);
    if (category !== 'all') params.append('category', category);
    if (newspaper) params.append('newspaper', newspaper);
    if (date) params.append('date', date);
    if (publisher) params.append('publisher', publisher);
    if (sort) params.append('sort', sort);

    onClose();
    navigate(`/newspapers?${params.toString()}`);
  };

  const handleReset = () => {
    setQ('');
    setLanguageCode('all');
    setCategory('all');
    setNewspaper('');
    setDate('');
    setPublisher('');
    setSort('newest');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Global Newspaper Search</h3>
              <p className="text-xs text-gray-500">Filter by language, publisher, date & topic</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Form Controls */}
        <form onSubmit={handleApplySearch} className="p-6 space-y-5 flex-1">
          
          {/* Main Keyword Search */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search newspaper name, topic, city..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Dynamic Language Filter (Section 4 A & 9) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Language
            </label>
            <select
              value={languageCode}
              onChange={e => setLanguageCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">All Languages ({languages.length})</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.code}>
                  {lang.native_name} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Newspaper Name / Title Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Specific Newspaper
            </label>
            <input
              type="text"
              value={newspaper}
              onChange={e => setNewspaper(e.target.value)}
              placeholder="e.g. Anandabazar, Indian Express"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Date & Publisher */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Edition Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={e => setPublisher(e.target.value)}
                placeholder="Publisher name"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Sort Results By
            </label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="newest">Latest Editions First</option>
              <option value="oldest">Oldest Editions First</option>
              <option value="views">Most Read Editions</option>
              <option value="title">Alphabetical Title</option>
            </select>
          </div>

        </form>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3 sticky bottom-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {loading ? (
                'Calculating results...'
              ) : (
                <>Found <strong className="text-gray-900 font-bold">{resultCount ?? 0}</strong> matching editions</>
              )}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <button
            onClick={handleApplySearch}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-colors"
          >
            <span>View Search Results ({resultCount ?? 0})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import NewspaperCard from '../components/NewspaperCard';

export default function Newspapers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [newspapers, setNewspapers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state from URL query
  const q = searchParams.get('q') || '';
  const languageCode = searchParams.get('languageCode') || 'all';
  const category = searchParams.get('category') || 'all';
  const date = searchParams.get('date') || '';
  const publisher = searchParams.get('publisher') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    Promise.all([apiFetch('/languages'), apiFetch('/categories')])
      .then(([langs, cats]) => {
        setLanguages(langs || []);
        setCategories(cats || []);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const queryStr = searchParams.toString();
    apiFetch(`/newspapers/search?${queryStr}`)
      .then(res => {
        setNewspapers(res.newspapers || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(err => console.error('Failed to fetch newspapers search', err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value.toString());
    } else {
      newParams.delete(key);
    }
    // Only reset page to 1 when changing filters, NOT when paginating
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    updateParam('page', newPage);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif">All Digital Newspapers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and read authorized newspaper PDF editions across all languages and categories
        </p>
      </div>

      {/* Filter Control Bar (Section 8 & Section 9) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={e => updateParam('q', e.target.value)}
              placeholder="Search newspaper name..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Language Selector */}
          <div>
            <select
              value={languageCode}
              onChange={e => updateParam('languageCode', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.code}>
                  {lang.native_name} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={category}
              onChange={e => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={date}
              onChange={e => updateParam('date', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

        </div>

        {/* Language Filter Pills (Section 8) */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 border-t border-gray-50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Quick Language:</span>
          <button
            onClick={() => updateParam('languageCode', 'all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              languageCode === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => updateParam('languageCode', lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                languageCode === lang.code ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang.native_name}
            </button>
          ))}
        </div>

        {/* Results Info & Reset */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>Found <strong className="text-gray-900 font-bold">{pagination.total}</strong> editions</span>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-gray-400 hover:text-brand-600 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>

      </div>

      {/* Grid of Newspapers */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 h-72 animate-pulse space-y-4">
              <div className="bg-gray-200 h-40 rounded-xl"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-8 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : newspapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newspapers.map(paper => (
            <NewspaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Newspaper className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No newspapers found</h3>
          <p className="text-xs text-gray-500">
            No editions match your selected language or search filter. Try clearing filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 rounded-xl text-gray-700 font-bold transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-gray-700 px-3 font-mono">
            Page <strong className="text-brand-600 font-bold">{page}</strong> of {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 rounded-xl text-gray-700 font-bold transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

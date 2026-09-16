import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Calendar, Globe, Building, ShieldCheck, Bookmark, ArrowLeft, Layers } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PdfReader from '../components/PdfReader';

export default function NewspaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [newspaper, setNewspaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isReading = searchParams.get('read') === 'true';

  useEffect(() => {
    setLoading(true);
    apiFetch(`/newspapers/${id}`)
      .then(data => setNewspaper(data))
      .catch(err => setError(err.message || 'Edition not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const setReadingMode = (val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('read', 'true');
    } else {
      newParams.delete('read');
    }
    setSearchParams(newParams, { replace: true });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-gray-600">Loading newspaper edition...</p>
      </div>
    );
  }

  if (error || !newspaper) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Newspaper Not Found</h3>
        <p className="text-xs text-gray-500">{error || 'This newspaper edition is unavailable'}</p>
        <button
          onClick={() => navigate('/newspapers')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Newspapers
        </button>
      </div>
    );
  }

  // Full-screen Reader Mode
  if (isReading) {
    return (
      <PdfReader
        newspaper={newspaper}
        onBack={() => setReadingMode(false)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <button
        onClick={() => navigate('/newspapers')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Preview Badge */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-50/70 via-slate-100 to-indigo-100/40 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-72 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white bg-brand-600 px-3 py-1 rounded-full shadow-sm">
              {newspaper.language_native_name || newspaper.language_name}
            </span>
            <span className="text-xs font-semibold text-gray-600 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              {newspaper.category_name}
            </span>
          </div>

          <div className="text-center font-serif my-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {newspaper.title}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Published by {newspaper.publisher}
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500 bg-white/90 p-2.5 rounded-xl font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-brand-600" />
              {newspaper.edition_date}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4 text-gray-400" />
              {newspaper.page_count || 16} Pages
            </span>
          </div>
        </div>

        {/* Right Column: Metadata & Read Action */}
        <div className="md:col-span-7 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4" />
              <span>{newspaper.language_name} Digital Newspaper</span>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 font-serif leading-tight">
              {newspaper.title}
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {newspaper.description || 'Full digital edition available for online reading.'}
            </p>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-gray-400 block font-medium">Publisher:</span>
              <span className="font-bold text-gray-800">{newspaper.publisher}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Edition Date:</span>
              <span className="font-bold text-gray-800">{newspaper.edition_date}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Category:</span>
              <span className="font-bold text-gray-800">{newspaper.category_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Page Count:</span>
              <span className="font-bold text-gray-800">{newspaper.page_count} Pages</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setReadingMode(true)}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              <span>Read Edition Online (PDF)</span>
            </button>

            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Protected Reader Active
              </span>
              <span>Reads: {newspaper.views_count || 0}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

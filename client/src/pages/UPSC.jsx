import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function UPSC() {
  const [brief, setBrief] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter, search]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const articles = await apiFetch(`/upsc/articles?${params.toString()}`);
      setBrief({ allArticles: articles || [] });
    } catch (err) {
      console.error('Failed to load UPSC articles', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Updates' },
    { id: 'Top News', label: 'Top 10 News' },
    { id: 'Prelims Facts', label: 'Prelims Facts' },
    { id: 'Mains Analysis', label: 'Mains Analysis' },
    { id: 'Govt Schemes', label: 'Govt Schemes' },
    { id: 'Economy', label: 'Economy' },
    { id: 'Environment', label: 'Environment' },
    { id: 'Practice Questions', label: 'Practice Questions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* UPSC Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Aspirant Section</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight leading-tight">
            UPSC / IAS Daily Preparation Hub
          </h1>

          <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
            Curated daily current affairs, high-yield Prelims facts, structural Mains editorial analysis, government schemes, and daily practice questions.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics, schemes, keywords..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900 font-bold">{brief?.allArticles?.length || 0}</strong> UPSC briefs
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 border-t border-gray-50">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse space-y-3">
              <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
              <div className="bg-gray-200 h-4 w-full rounded"></div>
              <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
            </div>
          ))}
        </div>
      ) : brief && brief.allArticles && brief.allArticles.length > 0 ? (
        <div className="space-y-6">
          {brief.allArticles.map(article => {
            const isExpanded = expandedArticleId === article.id;

            return (
              <div
                key={article.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 hover:border-amber-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{article.published_date}</span>
                  </div>

                  {article.tags && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      <span>{article.tags}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-serif leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                {/* Prelims & Mains Details */}
                <div className="space-y-3 pt-2">
                  {article.prelims_points && (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-xs space-y-2">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>High-Yield Prelims Facts</span>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                        {article.prelims_points}
                      </div>
                    </div>
                  )}

                  {article.mains_analysis && (
                    <div className="border border-slate-100 rounded-2xl p-4 text-xs space-y-2 bg-slate-50">
                      <div 
                        onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                        className="font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-brand-600" />
                          <span>Mains Perspective & Analytical Breakdown</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                      {isExpanded && (
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed pt-2 border-t border-slate-200">
                          {article.mains_analysis}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
          <BookOpen className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No UPSC updates found</h3>
          <p className="text-xs text-gray-500">No articles match your chosen category or search text.</p>
        </div>
      )}

    </div>
  );
}

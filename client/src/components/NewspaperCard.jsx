import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Bookmark, Eye, Layers } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewspaperCard({ paper, isBookmarkedInitial = false, onBookmarkToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitial);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save newspapers to your bookmarks');
      return;
    }

    setBookmarkLoading(true);
    try {
      const res = await apiFetch('/user/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ newspaperId: paper.id })
      });
      setBookmarked(res.isBookmarked);
      if (onBookmarkToggle) onBookmarkToggle(paper.id, res.isBookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className="newspaper-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between group">
      
      {/* Upper Media Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center">
        {/* Placeholder / Thumbnail preview design */}
        <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 via-slate-100 to-indigo-100/30 p-4 flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-600 text-white shadow-sm">
              {paper.language_native_name || paper.language_name}
            </span>

            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkLoading}
              className={`p-1.5 rounded-full transition-colors ${
                bookmarked
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-amber-500 hover:bg-white'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
            </button>
          </div>

          <div className="text-center my-auto px-2">
            <h3 className="font-extrabold text-gray-900 text-base line-clamp-2 font-serif group-hover:text-brand-600 transition-colors">
              {paper.title}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {paper.publisher}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              {paper.edition_date}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              {paper.page_count || 16} Pages
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & CTA */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
            {paper.category_name}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <Eye className="w-3.5 h-3.5" />
            {paper.views_count || 0} reads
          </span>
        </div>

        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <button
            onClick={() => navigate(`/newspapers/${paper.id}`)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-brand-500/20"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Edition</span>
          </button>
        </div>
      </div>

    </div>
  );
}

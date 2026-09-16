import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NewspaperCard from '../components/NewspaperCard';

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiFetch('/user/bookmarks')
        .then(data => setBookmarks(data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleBookmarkToggle = (paperId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.id !== paperId));
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Please Log In</h2>
        <p className="text-xs text-gray-500">Sign in to save and manage your favorite newspaper editions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-amber-500 fill-amber-500" />
          <span>Saved Bookmarks</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your saved digital newspaper editions</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 h-64 animate-pulse"></div>
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map(paper => (
            <NewspaperCard 
              key={paper.id} 
              paper={paper} 
              isBookmarkedInitial={true}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
          <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No saved bookmarks yet</h3>
          <p className="text-xs text-gray-500">Click the bookmark icon on any newspaper card to save it here.</p>
        </div>
      )}
    </div>
  );
}

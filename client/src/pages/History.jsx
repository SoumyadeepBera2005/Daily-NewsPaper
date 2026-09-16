import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, BookOpen, Clock, Calendar } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReadingHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiFetch('/user/history')
        .then(data => setHistory(data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <History className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Please Log In</h2>
        <p className="text-xs text-gray-500">Sign in to track your reading history and resume pages.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
          <History className="w-7 h-7 text-brand-600" />
          <span>Reading History</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Resume where you left off on previously read editions</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 h-20 animate-pulse"></div>
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map(item => (
            <div
              key={item.history_id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-200 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-600">
                  <span>{item.language_native_name || item.language_name}</span>
                  <span>•</span>
                  <span>{item.edition_date}</span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base font-serif">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    Last Read: Page {item.last_page} of {item.page_count}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.last_read_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/newspapers/${item.id}`)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resume Reading</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
          <History className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No reading history yet</h3>
          <p className="text-xs text-gray-500">Open and read any newspaper edition to track your progress here.</p>
        </div>
      )}
    </div>
  );
}

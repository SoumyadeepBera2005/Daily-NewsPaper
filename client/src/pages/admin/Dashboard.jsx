import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, CheckCircle2, Eye, Users, Newspaper, RefreshCcw, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    apiFetch('/admin/stats')
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 w-1/4 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-serif">Admin Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time publishing analytics & upload metrics</p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-brand-600 transition-colors"
          title="Refresh Stats"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Uploads</span>
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats?.todayUploads || 0}</div>
          <p className="text-[11px] text-gray-400">PDFs uploaded today</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Published Editions</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats?.publishedCount || 0}</div>
          <p className="text-[11px] text-gray-400">Out of {stats?.totalNewspapers || 0} total uploaded</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-skyAccent">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Reads</span>
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats?.totalViews || 0}</div>
          <p className="text-[11px] text-gray-400">Cumulative PDF views</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amberAccent">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Readers</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats?.totalUsers || 0}</div>
          <p className="text-[11px] text-gray-400">Subscribers & Aspirants</p>
        </div>

      </div>

      {/* Readership Breakdown & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Language Readership Bar Chart Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base font-serif">Language Readership Breakdown</h3>
          <div className="space-y-3">
            {stats?.languageStats?.map(lang => (
              <div key={lang.language_name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800">{lang.native_name} ({lang.language_name})</span>
                  <span className="text-gray-500">{lang.count} editions • {lang.total_views || 0} reads</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((lang.total_views || 0) / (stats.totalViews || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base font-serif">Recent PDF Upload Log</h3>
            <Link to="/admin/newspapers" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentUploads?.map(paper => (
                  <tr key={paper.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-gray-900 max-w-xs truncate">{paper.title}</td>
                    <td className="p-3 text-gray-600">{paper.language_name}</td>
                    <td className="p-3 text-gray-500">{paper.edition_date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        paper.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {paper.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

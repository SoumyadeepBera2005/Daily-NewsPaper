import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Newspaper, ArrowRight, BookOpen, Sparkles, Globe, 
  Search, ShieldCheck, CheckCircle2, TrendingUp, Layers
} from 'lucide-react';
import { apiFetch } from '../services/api';
import NewspaperCard from '../components/NewspaperCard';

export default function Home() {
  const navigate = useNavigate();
  const [todayNewspapers, setTodayNewspapers] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [upscBrief, setUpscBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [todayRes, langRes, upscRes] = await Promise.all([
          apiFetch('/newspapers/today'),
          apiFetch('/languages'),
          apiFetch('/upsc/today')
        ]);

        setTodayNewspapers(todayRes.newspapers || []);
        setIsFallback(todayRes.isFallback || false);
        setLanguages(langRes || []);
        setUpscBrief(upscRes || null);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16">
      
      {/* 1. Hero Section (Section 6 & 23 requirement: soft gradient, light blue/indigo, non-dark theme) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-sky-50/40 to-paperBg pt-12 pb-16 border-b border-indigo-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Free Digital Newspaper Reading Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight font-serif">
                Read. Learn. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-skyAccent">
                  Stay Updated Daily.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Access Bengali, English, Hindi and multi-language daily newspapers online in a crisp, high-resolution reader alongside structured UPSC / IAS current affairs briefs.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/newspapers')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Newspaper className="w-5 h-5" />
                  <span>Read Today's Newspapers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/upsc')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>UPSC Daily Brief</span>
                </button>
              </div>

              {/* Feature Highlights */}
              <div className="pt-6 border-t border-indigo-100/60 grid grid-cols-3 gap-4 text-xs text-gray-500 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Free Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bengali & English</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>High-Res Reader</span>
                </div>
              </div>

            </div>

            {/* Right Card Stack Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Live Today Edition
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-indigo-50 rounded-2xl p-4 flex flex-col justify-between border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-lg">বাংলা • Kolkata</span>
                      <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">30 Aug 2026</span>
                    </div>
                    <div className="text-center font-serif py-3">
                      <h4 className="font-extrabold text-gray-900 text-lg">আনন্দবাজার পত্রিকা</h4>
                      <p className="text-xs text-gray-500 mt-1">Authorized Digital PDF Edition</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 bg-white/80 p-2 rounded-xl">
                      <span>32 Pages</span>
                      <span className="font-bold text-brand-600">Read PDF →</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Protected Reader</span>
                    <span className="font-semibold text-gray-700">13 Active Languages</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Today's Newspapers Section (Section 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">Today's Newspapers</h2>
              {isFallback && (
                <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                  Latest Available Editions
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Browse today's published newspaper editions across languages</p>
          </div>

          <Link
            to="/newspapers"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Browse All Editions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 h-72 animate-pulse space-y-4">
                <div className="bg-gray-200 h-40 rounded-xl"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-8 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : todayNewspapers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {todayNewspapers.map(paper => (
              <NewspaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          /* Empty State (Section 28) */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No newspaper uploaded for today yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              The administrator has not published today's edition yet. You can browse previous editions or search archives.
            </p>
            <Link
              to="/newspapers"
              className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Browse Previous Editions
            </Link>
          </div>
        )}
      </section>

      {/* 3. Dynamic Language Sections (Section 4 A requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-t border-gray-200 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 font-serif flex items-center gap-2">
                <Globe className="w-6 h-6 text-brand-600" />
                <span>Browse by Language</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Every active language section dynamically generated</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => navigate(`/newspapers?languageCode=${lang.code}`)}
                className="p-4 bg-white hover:bg-brand-50 rounded-2xl border border-gray-100 hover:border-brand-200 text-left transition-all transform hover:-translate-y-1 group"
              >
                <div className="font-extrabold text-gray-900 text-lg group-hover:text-brand-600 font-serif">
                  {lang.native_name}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">
                  {lang.name} Newspapers
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. UPSC / IAS Preparation Spotlight (Section 4 C) */}
      {upscBrief && upscBrief.allArticles && upscBrief.allArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/30 rounded-3xl p-8 border border-amber-200/70 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold mb-2 shadow-sm">
                  ⭐ UPSC Aspirant Hub
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">Today's UPSC Current Affairs Brief</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Daily National, Economy, Environment & Editorial Mains perspectives</p>
              </div>

              <Link
                to="/upsc"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Open UPSC Preparation Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upscBrief.allArticles.slice(0, 3).map(article => (
                <div key={article.id} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2">
                      {article.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <Link
                    to="/upsc"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 pt-2 border-t border-gray-50"
                  >
                    <span>Read Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}

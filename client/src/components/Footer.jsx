import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5 text-brand-600 font-bold text-lg">
              <img src="/logo.svg" alt="Daily News Hub Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
              <span className="text-gray-900 font-extrabold">Daily News</span> Hub
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Modern digital newspaper reading platform. Access Bengali, English, Hindi, and regional newspapers along with daily UPSC current affairs preparation briefs.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-brand-600">Home</Link></li>
              <li><Link to="/newspapers" className="hover:text-brand-600">All Newspapers</Link></li>
              <li><Link to="/newspapers?languageCode=bn" className="hover:text-brand-600">Bengali Newspapers (বাংলা)</Link></li>
              <li><Link to="/newspapers?languageCode=en" className="hover:text-brand-600">English Newspapers</Link></li>
              <li><Link to="/upsc" className="hover:text-amber-600 font-medium">UPSC / IAS Daily Brief</Link></li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/newspapers?category=national" className="hover:text-brand-600">National News</Link></li>
              <li><Link to="/newspapers?category=business" className="hover:text-brand-600">Business & Economy</Link></li>
              <li><Link to="/newspapers?category=sports" className="hover:text-brand-600">Sports Editions</Link></li>
              <li><Link to="/newspapers?category=editorial" className="hover:text-brand-600">Editorial Analysis</Link></li>
            </ul>
          </div>

          {/* Col 4: Copyright Notice & Protection */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">Source & Licensing</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Copyright Compliance</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Content is sourced via official legal feeds or authorized admin PDF uploads. Downloading and redistribution are strictly restricted.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Daily News Hub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for readers & aspirants</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

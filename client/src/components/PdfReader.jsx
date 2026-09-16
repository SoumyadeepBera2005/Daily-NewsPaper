import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, 
  ShieldAlert, Layers, ArrowLeft, RefreshCw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Configure CDN worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function PdfReader({ newspaper, onBack }) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(newspaper?.page_count || 1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [useIframeMode, setUseIframeMode] = useState(false);
  const [securityAlert, setSecurityAlert] = useState('');
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL || '';
  const streamUrl = `${apiBase}/api/newspapers/${newspaper?.id}/stream`;

  // Trigger anti-tamper security alert toast
  const triggerAlert = (msg) => {
    setSecurityAlert(msg);
    setTimeout(() => {
      setSecurityAlert(prev => prev === msg ? '' : prev);
    }, 3500);
  };

  // Anti-Copy, Anti-Screenshot, and Anti-Print event listeners
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerAlert('Right-click context menu is disabled on protected editions.');
    };

    const handleCopyCut = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Text copying from this newspaper publication is restricted.');
      }
      triggerAlert('Text selection & copying are disabled on protected publications.');
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';

      // Intercept PrintScreen key
      if (e.key === 'PrintScreen' || key === 'printscreen') {
        e.preventDefault();
        try {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('');
          }
        } catch (err) {}
        triggerAlert('Screenshots and screen captures are strictly restricted.');
        setIsWindowBlurred(true);
        setTimeout(() => setIsWindowBlurred(false), 2500);
        return;
      }

      // Intercept Save (Ctrl+S), Print (Ctrl+P), Copy (Ctrl+C), View Source (Ctrl+U), DevTools (F12, Ctrl+Shift+I)
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'c', 'u'].includes(key)) {
        e.preventDefault();
        if (key === 'c') {
          triggerAlert('Text & content copying is restricted.');
        } else if (key === 'p') {
          triggerAlert('Direct printing of newspaper editions is restricted.');
        } else if (key === 's') {
          triggerAlert('Saving publication files locally is restricted.');
        }
        return;
      }

      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'c' || key === 'j'))) {
        e.preventDefault();
        triggerAlert('Developer tools inspection is disabled.');
        return;
      }

      // Page Navigation Shortcuts
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        try {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('');
          }
        } catch (err) {}
      }
    };

    // Obscure content when screenshot tool/external window focus is triggered
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('contextmenu', handleContextMenu);
      containerEl.addEventListener('copy', handleCopyCut);
      containerEl.addEventListener('cut', handleCopyCut);
      containerEl.addEventListener('selectstart', handleSelectStart);
      containerEl.addEventListener('dragstart', handleDragStart);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (containerEl) {
        containerEl.removeEventListener('contextmenu', handleContextMenu);
        containerEl.removeEventListener('copy', handleCopyCut);
        containerEl.removeEventListener('cut', handleCopyCut);
        containerEl.removeEventListener('selectstart', handleSelectStart);
        containerEl.removeEventListener('dragstart', handleDragStart);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage, totalPages]);

  // Load PDF document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!newspaper?.id) return;
      setLoading(true);

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: streamUrl,
          withCredentials: true
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setUseIframeMode(false);
      } catch (err) {
        console.warn('PDF.js worker notice, rendering direct viewer:', err);
        if (!isCancelled) setUseIframeMode(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [streamUrl, newspaper?.id]);

  // Render Canvas Page
  useEffect(() => {
    if (!pdfDoc || useIframeMode) return;
    let isCancelled = false;

    async function renderPage() {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const scale = 1.6 * (zoomLevel / 100);
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        if (!isCancelled) setLoading(false);
      } catch (err) {
        console.warn('Canvas render notice, falling back to direct viewer:', err);
        if (!isCancelled) setUseIframeMode(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoomLevel, useIframeMode]);

  // Record History
  useEffect(() => {
    if (user && newspaper?.id) {
      apiFetch('/user/history', {
        method: 'POST',
        body: JSON.stringify({ newspaperId: newspaper.id, page: currentPage })
      }).catch(err => console.error(err));
    }
  }, [currentPage, newspaper?.id, user]);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  if (!newspaper) return null;

  return (
    <div 
      ref={containerRef} 
      className="reader-container fixed inset-0 z-50 flex flex-col h-screen w-screen bg-slate-900 text-white overflow-hidden select-none"
    >
      
      {/* Reader Header Bar */}
      <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/60 px-4 py-2.5 flex items-center justify-between z-30 shadow-md shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold transition-colors text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="hidden sm:block border-l border-slate-700 pl-3">
            <h2 className="text-sm font-bold text-white line-clamp-1">{newspaper.title}</h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-brand-400">{newspaper.language_native_name || newspaper.language_name}</span>
              <span>•</span>
              <span>{newspaper.edition_date}</span>
              <span>•</span>
              <span>{newspaper.publisher}</span>
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          {!useIframeMode && (
            <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700 text-xs">
              <button 
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white" 
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={handleResetZoom}
                className="px-2 py-0.5 text-[11px] font-mono font-medium text-slate-300 hover:text-white" 
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>

              <button 
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white" 
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!useIframeMode && (
            <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-[11px] text-slate-200">
                Page <span className="font-bold text-brand-400">{currentPage}</span> / {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Protected Edition</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Security Alert Toast */}
      {securityAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-rose-400 animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          <span>{securityAlert}</span>
        </div>
      )}

      {/* Screen Capture Blur Obscuration Layer */}
      {isWindowBlurred && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
          <h3 className="text-lg font-extrabold text-white">Protected Publication View</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Screen capture, window switching, or screenshot attempt detected. Return focus to the browser window to continue reading.
          </p>
        </div>
      )}

      {/* Main PDF Content Viewport */}
      <div className="flex-1 relative overflow-auto custom-scrollbar bg-slate-950 flex items-center justify-center">
        
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-3 text-slate-300">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-medium">Loading newspaper edition...</p>
          </div>
        )}

        {useIframeMode ? (
          <iframe
            src={`${streamUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-none bg-white no-copy"
            title="Newspaper Reader"
          />
        ) : (
          <div className="py-6 px-4 my-auto relative">
            <div className="shadow-2xl rounded bg-white overflow-hidden max-w-5xl mx-auto border border-slate-800 relative">
              
              {/* Rendered Newspaper Canvas */}
              <canvas ref={canvasRef} className="block w-full h-auto mx-auto pointer-events-none select-none" />

              {/* Transparent Shield Overlay (Prevents Right-Click or Selection on Canvas) */}
              <div 
                className="absolute inset-0 z-10 bg-transparent select-none"
                onContextMenu={e => {
                  e.preventDefault();
                  triggerAlert('Right-click context menu is disabled on protected editions.');
                }}
              />

              {/* Anti-Copy Security Watermark Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none watermark-overlay flex flex-col justify-between p-6 select-none overflow-hidden opacity-20">
                <div className="text-[10px] font-mono tracking-widest text-slate-900 font-bold rotate-[-12deg] transform translate-y-6">
                  PROTECTED EDITION • DO NOT COPY / SCREENSHOT • {user?.email || 'LICENSED READER'}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-900 font-bold rotate-[-12deg] transform -translate-y-6 self-end">
                  DAILY NEWS HUB • LICENSED COPY • {newspaper.title}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Footer Disclaimer Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-center text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          Daily News Hub Reader
        </span>
        <span className="text-slate-500 font-medium">
          Downloading and redistribution are restricted by publisher license.
        </span>
        <span className="hidden md:inline text-slate-400">
          Use ← Left / Right → key to change pages
        </span>
      </div>

    </div>
  );
}

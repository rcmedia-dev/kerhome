'use client'

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Zap, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiReplySuggestions({
  messages,
  propertyContext,
  onSelectReply,
}: {
  messages: { role: string; content: string }[];
  propertyContext?: any;
  onSelectReply: (text: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usedSuggestion, setUsedSuggestion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [suggestions]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.6, 160);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // Re-fetch suggestions when the message count changes
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setSuggestions([]);
      return;
    }
    setDismissed(false);
    let cancelled = false;
    setLoading(true);

    fetch('/api/mywai/reply-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, propertyContext }),
    })
      .then(res => res.json())
      .then(json => {
        if (!cancelled && Array.isArray(json.suggestions)) {
          setSuggestions(json.suggestions);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [messages.length]);

  if (dismissed || (!loading && suggestions.length === 0)) return null;

  return (
    <div className="relative z-10 px-3 py-2 bg-gradient-to-r from-purple-50 via-purple-50/70 to-white border-t border-purple-200/80 shrink-0 select-none shadow-[0_-4px_12px_rgba(130,10,209,0.08)]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles size={11} />
          </div>
          <span className="text-[11px] font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-wide uppercase">
            {loading ? 'MYWAI a pensar...' : 'Sugestões MYWAI'}
          </span>
          {loading && <Loader2 size={11} className="animate-spin text-purple-600" />}
        </div>
        <div className="flex items-center gap-1">
          {!loading && suggestions.length > 1 && (
            <div className="flex items-center gap-0.5 mr-0.5" role="group" aria-label="Navegar sugestões">
              <button
                type="button"
                onClick={() => scrollByDir(-1)}
                disabled={!canScrollLeft}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                  canScrollLeft
                    ? "bg-white text-purple-700 border-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 cursor-pointer shadow-sm"
                    : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                )}
                title="Sugestão anterior"
                aria-label="Sugestão anterior"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => scrollByDir(1)}
                disabled={!canScrollRight}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                  canScrollRight
                    ? "bg-white text-purple-700 border-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 cursor-pointer shadow-sm"
                    : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                )}
                title="Próxima sugestão"
                aria-label="Próxima sugestão"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 -mr-1 text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-colors cursor-pointer"
            title="Ocultar sugestões"
            aria-label="Ocultar sugestões"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling pill chips */}
      <div className="relative">
        {(canScrollLeft || canScrollRight) && (
          <div className="pointer-events-none absolute inset-y-0 -left-1 w-6 bg-gradient-to-r from-purple-50 to-transparent z-10" aria-hidden />
        )}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 scroll-smooth touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loading && suggestions.length === 0 ? (
            <div className="flex gap-2 py-1 animate-pulse">
              <div className="h-9 w-36 bg-purple-200/70 rounded-full" />
              <div className="h-9 w-48 bg-purple-200/70 rounded-full" />
            </div>
          ) : (
            suggestions.map((text, i) => {
              const isUsed = usedSuggestion === text;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelectReply(text);
                    setUsedSuggestion(text);
                  }}
                  disabled={isUsed}
                  className={cn(
                    "shrink-0 min-h-9 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border active:scale-95",
                    isUsed
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                      : "bg-white text-purple-900 border-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:bg-purple-700"
                  )}
                  title={text}
                >
                  <Zap size={12} className={isUsed ? "text-gray-400" : "text-purple-600 shrink-0"} />
                  <span className="max-w-[240px] sm:max-w-[360px] truncate text-left">{text}</span>
                </button>
              );
            })
          )}
        </div>
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 -right-1 w-8 bg-gradient-to-l from-purple-50 to-transparent z-10" aria-hidden />
        )}
      </div>
    </div>
  );
}


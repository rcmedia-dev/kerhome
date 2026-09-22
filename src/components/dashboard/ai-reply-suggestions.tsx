'use client'

import { useEffect, useState } from 'react';
import { Sparkles, Zap, Loader2, X } from 'lucide-react';
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
    <div className="px-3 py-1.5 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/40 border-t border-purple-100/80 shrink-0 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1 px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Sparkles size={9} />
          </div>
          <span className="text-[10px] font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-wide uppercase">
            {loading ? 'MYWAI a pensar...' : 'Sugestões MYWAI'}
          </span>
          {loading && <Loader2 size={10} className="animate-spin text-purple-600" />}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 -mr-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
          title="Ocultar sugestões"
          aria-label="Ocultar sugestões"
        >
          <X size={12} />
        </button>
      </div>

      {/* Horizontal scrolling pill chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        {loading && suggestions.length === 0 ? (
          <div className="flex gap-2 py-0.5 animate-pulse">
            <div className="h-7 w-32 bg-purple-100/60 rounded-full" />
            <div className="h-7 w-44 bg-purple-100/60 rounded-full" />
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
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border active:scale-95",
                  isUsed
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                    : "bg-white text-purple-800 border-purple-200/90 hover:bg-purple-600 hover:text-white hover:border-purple-600 active:bg-purple-700"
                )}
                title={text}
              >
                <Zap size={11} className={isUsed ? "text-gray-400" : "text-purple-600 shrink-0"} />
                <span className="max-w-[220px] sm:max-w-[320px] truncate text-left">{text}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}


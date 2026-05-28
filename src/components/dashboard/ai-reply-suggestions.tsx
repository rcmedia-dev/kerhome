'use client'

import { useEffect, useState } from 'react';
import { Sparkles, Zap, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (messages.length === 0) {
      setSuggestions([]);
      return;
    }
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
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={11} className="text-purple-500" />
        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
          {loading ? 'MYWAI a pensar...' : 'Sugestões MYWAI'}
        </span>
        {loading && <Loader2 size={10} className="animate-spin text-purple-400" />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((text, i) => (
          <button
            key={i}
            onClick={() => {
              onSelectReply(text);
              setUsedSuggestion(text);
            }}
            disabled={usedSuggestion === text}
            className="px-3 py-1.5 bg-white border border-purple-100 rounded-full text-[10px] font-semibold text-purple-700 hover:bg-purple-600 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
          >
            <Zap size={10} />
            {text.length > 50 ? text.slice(0, 50) + '…' : text}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client'

import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

export function AiDescriptionGenerator({
  property,
  onDescriptionGenerated,
}: {
  property: any;
  onDescriptionGenerated: (desc: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/mywai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property }),
      });
      const json = await res.json();
      if (json.description) {
        onDescriptionGenerated(String(json.description));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-xs font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : success ? (
        <Check size={14} />
      ) : (
        <Sparkles size={14} />
      )}
      {loading ? 'A gerar...' : success ? 'Descr. gerada!' : 'Gerar descrição com MYWAI'}
    </button>
  );
}

'use client'

import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';

interface AiEnhanceButtonProps {
  fieldName: string;
  currentValue: string | undefined;
  formData?: Record<string, any>;
  onEnhanced: (value: string) => void;
  size?: 'sm' | 'xs';
}

const labels: Record<string, { idle: string; loading: string; success: string }> = {
  title: { idle: 'Melhorar título com IA', loading: 'A melhorar...', success: 'Título melhorado!' },
  description: { idle: 'Melhorar descrição com IA', loading: 'A melhorar...', success: 'Descrição melhorada!' },
};

export function AiEnhanceButton({ fieldName, currentValue, formData, onEnhanced, size = 'sm' }: AiEnhanceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEnhance = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/mywai/enhance-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName, currentValue, formData }),
      });
      const json = await res.json();
      if (json.enhancedValue) {
        onEnhanced(String(json.enhancedValue));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const label = labels[fieldName] || { idle: 'Melhorar com IA', loading: 'A melhorar...', success: 'Melhorado!' };

  const iconSize = size === 'xs' ? 12 : 14;

  return (
    <button
      type="button"
      onClick={handleEnhance}
      disabled={loading || !currentValue}
      className={`flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap ${
        size === 'xs' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
      }`}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : success ? (
        <Check size={iconSize} />
      ) : (
        <Sparkles size={iconSize} />
      )}
      {loading ? label.loading : success ? label.success : label.idle}
    </button>
  );
}

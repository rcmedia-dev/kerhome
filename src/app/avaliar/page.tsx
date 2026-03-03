'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Search, MapPin, Ruler, CheckCircle2,
    ArrowRight, Info, Calculator, LayoutGrid,
    Sparkles, ShieldCheck, TrendingUp, Building2,
    Waves, Building, Zap, Sun, X, Plus, Loader2
} from 'lucide-react';
import { useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthDialog } from '@/components/login-modal';
import { useUserStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- DATA & CONSTANTS (Section 4.2 & Specs) ---

const BAIRROS = [
    { id: 'talatona', nome: 'Talatona', classificacao: 'premium' },
    { id: 'ilha', nome: 'Ilha de Luanda', classificacao: 'premium' },
    { id: 'alvalade', nome: 'Alvalade', classificacao: 'premium' },
    { id: 'benfica', nome: 'Benfica', classificacao: 'medio' },
    { id: 'novavida', nome: 'Nova Vida', classificacao: 'medio' },
    { id: 'viana', nome: 'Viana', classificacao: 'popular' },
    { id: 'zango', nome: 'Zango', classificacao: 'popular' },
];

const PRECOS_M2: Record<string, { venda: number; arrendamento: number }> = {
    premium: { venda: 1200000, arrendamento: 8000 },
    medio: { venda: 700000, arrendamento: 4500 },
    popular: { venda: 400000, arrendamento: 2500 },
};

const MULTIPLICADORES_ESTADO = {
    novo: 0.10,
    muito_bom: 0.05,
    normal: 0.00,
    reforma: -0.10,
};

const MULTIPLICADORES_EXTRAS = {
    piscina: { val: 0.05, icon: Waves, label: 'Piscina' },
    condominio: { val: 0.07, icon: Building, label: 'Condomínio' },
    gerador: { val: 0.03, icon: Zap, label: 'Gerador' },
    vista_mar: { val: 0.08, icon: Sun, label: 'Vista Mar' },
};

// --- HELPER COMPONENTS ---

const formatAKZ = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value) + ' AKZ';
};

const AnimatedNumber = ({ value }: { value: number }) => {
    const motionValue = useMotionValue(value);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        mass: 1
    });
    const displayValue = useTransform(springValue, (latest: number) => formatAKZ(latest));

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return (
        <motion.span
            suppressHydrationWarning
            className="tabular-nums"
        >
            {displayValue}
        </motion.span>
    );
};

export default function AvaliarPage() {
    const { user } = useUserStore();
    const router = useRouter();
    const authDialogRef = useRef<{ open: () => void }>(null);

    // Form State
    const [bairroId, setBairroId] = useState(BAIRROS[0].id);
    const [searchTerm, setSearchTerm] = useState("");
    const [tipoNegocio, setTipoNegocio] = useState<'venda' | 'arrendamento'>('venda');
    const [metragem, setMetragem] = useState(100);
    const [estado, setEstado] = useState<keyof typeof MULTIPLICADORES_ESTADO>('normal');
    const [extras, setExtras] = useState<Record<string, boolean>>({
        piscina: false,
        condominio: false,
        gerador: false,
        vista_mar: false,
    });
    const [customExtras, setCustomExtras] = useState<string[]>([]);
    const [newExtraInput, setNewExtraInput] = useState("");
    const [hasMounted, setHasMounted] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Sync search with pills
    useEffect(() => {
        if (searchTerm) {
            const match = BAIRROS.find(b => b.nome.toLowerCase() === searchTerm.toLowerCase());
            if (match) {
                setBairroId(match.id);
            } else {
                setBairroId('outra_localizacao');
            }
        }
    }, [searchTerm]);

    // --- CALCULATION LOGIC (Section 4.3) ---
    const results = useMemo(() => {
        let bairro = BAIRROS.find(b => b.id === bairroId);

        // Fallback for 'outra_localizacao'
        if (!bairro || bairroId === 'outra_localizacao') {
            bairro = { id: 'outra_localizacao', nome: searchTerm || 'Outra Localização', classificacao: 'popular' };
        }

        // Passo 2: Buscar preço por m²
        const precoM2 = PRECOS_M2[bairro.classificacao][tipoNegocio];

        // Passo 3: Preço base
        const precoBase = precoM2 * metragem;

        // Passo 4: Somar percentuais
        let adjustment = MULTIPLICADORES_ESTADO[estado];
        Object.entries(extras).forEach(([extra, active]) => {
            if (active) {
                adjustment += MULTIPLICADORES_EXTRAS[extra as keyof typeof MULTIPLICADORES_EXTRAS].val;
            }
        });

        // Impacto dos Custom Extras: +0.5% por item, teto de 3%
        const customAdjustment = Math.min(0.03, customExtras.length * 0.005);
        adjustment += customAdjustment;

        // Limites de ajuste: [+20%, -15%]
        const finalAdjustment = Math.max(-0.15, Math.min(0.20, adjustment));

        // Passo 5: Preço final
        const precoFinal = precoBase * (1 + finalAdjustment);

        // Passo 6: Faixa estimada
        const faixaMin = precoFinal * 0.95;
        const faixaMax = precoFinal * 1.05;

        return {
            precoFinal,
            faixaMin,
            faixaMax,
            adjustment: finalAdjustment
        };
    }, [bairroId, tipoNegocio, metragem, estado, extras, customExtras]);

    const toggleExtra = (id: string) => {
        setExtras(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddCustomExtra = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newExtraInput.trim()) {
            e.preventDefault();
            if (!customExtras.includes(newExtraInput.trim())) {
                setCustomExtras(prev => [...prev, newExtraInput.trim()]);
            }
            setNewExtraInput("");
        }
    };

    const removeCustomExtra = (tag: string) => {
        setCustomExtras(prev => prev.filter(t => t !== tag));
    };

    const handleCalculate = () => {
        if (metragem < 20) return;

        setIsCalculating(true);
        setHasCalculated(false); // Reset if calculating again

        setTimeout(() => {
            setHasCalculated(true);
            setIsCalculating(false);

            // Universal smooth scroll to results section
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    const section = document.getElementById('results-section');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        }, 1500);
    };

    const handlePublish = () => {
        if (!user) {
            authDialogRef.current?.open();
        } else {
            router.push('/dashboard/cadastrar-imovel');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <AuthDialog ref={authDialogRef} defaultMode="signUp" />

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-stretch">

                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col justify-center py-8 lg:py-0"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                <Sparkles size={14} />
                                Inteligência de Mercado
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6">
                                Descubra o Valor Real <br /><span className="text-orange-600">do seu Imóvel</span>
                            </h1>
                            <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-8">
                                Utilize a nossa ferramenta de avaliação orientativa baseada em parâmetros regionais atualizados. Capture a melhor oportunidade em Luanda.
                            </p>

                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                    <ShieldCheck className="text-green-500" size={18} />
                                    <span className="text-sm font-bold text-gray-700">Estimativa Grátis</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                    <TrendingUp className="text-blue-500" size={18} />
                                    <span className="text-sm font-bold text-gray-700">Dados do Mercado 2026</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Form Card (Hero Search-like card) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-orange-900/5 border border-gray-100"
                        >
                            <div className="space-y-6">
                                {/* Bairro & Negocio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Localização</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                            <Input
                                                placeholder="Busque o bairro ou zona..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="bg-gray-50 border-0 h-12 rounded-2xl pl-10 pr-4 font-bold text-gray-700 focus-visible:ring-2 focus-visible:ring-orange-500"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {BAIRROS.map(b => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => {
                                                        setBairroId(b.id);
                                                        setSearchTerm(b.nome);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border ${bairroId === b.id ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
                                                >
                                                    {b.nome}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Tipo de Negócio</Label>
                                        <div className="flex bg-gray-50 p-1 rounded-2xl h-12">
                                            <button
                                                onClick={() => setTipoNegocio('venda')}
                                                className={`flex-1 rounded-xl text-xs font-bold transition-all ${tipoNegocio === 'venda' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400'}`}
                                            >
                                                Venda
                                            </button>
                                            <button
                                                onClick={() => setTipoNegocio('arrendamento')}
                                                className={`flex-1 rounded-xl text-xs font-bold transition-all ${tipoNegocio === 'arrendamento' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-400'}`}
                                            >
                                                Arrendar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Metragem */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Área Útil (m²)</Label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                        <Input
                                            type="number"
                                            min={20}
                                            value={metragem}
                                            onChange={(e) => setMetragem(Number(e.target.value))}
                                            className="bg-gray-50 border-0 h-12 rounded-2xl pl-10 pr-4 font-bold text-gray-700 focus-visible:ring-2 focus-visible:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Estado do Imovel */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Condição do Imóvel</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.keys(MULTIPLICADORES_ESTADO).map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setEstado(key as any)}
                                                className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${estado === key ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-gray-50 text-gray-400'}`}
                                            >
                                                {key.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Extras & Diferenciais */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Extras & Diferenciais</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(MULTIPLICADORES_EXTRAS).map(([key, item]) => (
                                            <button
                                                key={key}
                                                onClick={() => toggleExtra(key)}
                                                className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all ${extras[key] ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-100'}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Tags */}
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <Input
                                                placeholder="Outro diferencial? (Enter)"
                                                value={newExtraInput}
                                                onChange={(e) => setNewExtraInput(e.target.value)}
                                                onKeyDown={handleAddCustomExtra}
                                                className="bg-gray-50 border-0 h-10 rounded-xl pl-9 pr-4 text-xs font-bold text-gray-700 focus-visible:ring-1 focus-visible:ring-orange-500"
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <AnimatePresence>
                                                {customExtras.map((tag) => (
                                                    <motion.span
                                                        key={tag}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase border border-purple-100"
                                                    >
                                                        {tag}
                                                        <button
                                                            onClick={() => removeCustomExtra(tag)}
                                                            className="hover:text-purple-800 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCalculate}
                                    disabled={metragem < 20 || isCalculating}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-900/10 gap-3"
                                >
                                    {isCalculating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Analisando mercado...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator size={18} />
                                            Calcular Avaliação
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Results Section */}
            <AnimatePresence>
                {hasCalculated && results && (
                    <motion.section
                        id="results-section"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            duration: 0.7
                        }}
                        className="py-20 bg-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* Results Display */}
                                <div className="lg:col-span-8 flex flex-col gap-6">
                                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                            <TrendingUp size={240} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
                                                    <Sparkles size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold italic tracking-tighter">Sua Estimativa de Mercado</h2>
                                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest pl-1">Exclusivo Kercasa</p>
                                                </div>
                                            </div>

                                            <div className="mb-12">
                                                <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Faixa de Valor Sugerida:</p>
                                                <div className="text-3xl md:text-6xl font-black text-orange-500 leading-none glow-orange">
                                                    <AnimatedNumber value={results.faixaMin} />
                                                    <span className="text-3xl mx-4 text-white">ー</span>
                                                    <br className="md:hidden" />
                                                    <AnimatedNumber value={results.faixaMax} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Valor Médio Estimado</p>
                                                    <p className="text-2xl font-bold" suppressHydrationWarning>
                                                        {hasMounted ? <AnimatedNumber value={results.precoFinal} /> : '...'}
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Ajuste de Mercado Aplicado</p>
                                                    <p className={`text-2xl font-bold ${results.adjustment >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {results.adjustment > 0 ? '+' : ''}{(results.adjustment * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-10 p-6 bg-orange-600/10 border border-orange-600/20 rounded-[2rem]">
                                                <div className="flex gap-4">
                                                    <Info className="text-orange-600 mt-1" size={20} />
                                                    <div>
                                                        <p className="text-xs text-gray-400 leading-relaxed italic mb-4">
                                                            <strong>Aviso Legal OBRIGATÓRIO:</strong> Esta estimativa é orientativa e baseada em parâmetros regionais definidos pelo Kercasa. Não substitui avaliação técnica profissional de um perito imobiliário.
                                                        </p>

                                                        {(Object.values(extras).some(v => v === true) || customExtras.length > 0) && (
                                                            <div className="pt-4 border-t border-orange-600/10">
                                                                <p className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">Diferenciais Considerados:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(extras).map(([key, active]) => active && (
                                                                        <span key={key} className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-orange-400 uppercase">
                                                                            {MULTIPLICADORES_EXTRAS[key as keyof typeof MULTIPLICADORES_EXTRAS].label}
                                                                        </span>
                                                                    ))}
                                                                    {customExtras.map((tag) => (
                                                                        <span key={tag} className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-purple-400 uppercase">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversion CTAs */}
                                <div className="lg:col-span-4 h-full">
                                    <div className="bg-orange-600 p-6 md:p-8 rounded-[3rem] text-white shadow-2xl shadow-orange-900/20 h-full flex flex-col items-center text-center">
                                        <div className="w-full">
                                            <h3 className="text-xl md:text-2xl font-black mb-4 leading-tight">Aproveite este valor e venda agora!</h3>
                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-start gap-2 justify-center">
                                                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs font-medium opacity-90">Destaque instantâneo em Angola.</p>
                                                </div>
                                                <div className="flex items-start gap-2 justify-center">
                                                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs font-medium opacity-90">Gestão simplificada de propostas.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 w-full">
                                            <Button
                                                onClick={handlePublish}
                                                className="w-full bg-white text-orange-600 hover:bg-gray-100 h-12 rounded-2xl font-black text-[10px] uppercase shadow-xl group"
                                            >
                                                Publicar meu imóvel
                                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
                                            </Button>

                                            <Link href="/simular" className="block w-full">
                                                <Button
                                                    className="w-full bg-purple-700 text-white hover:bg-purple-800 h-12 rounded-2xl font-black text-[10px] uppercase shadow-xl"
                                                >
                                                    Simular financiamento
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Benefits / Footer info */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-12">Por que confiar no <span className="text-orange-600">Kercasa</span>?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: LayoutGrid, title: 'Amplo Alcance', desc: 'Sua propriedade vista por milhares de potenciais compradores diariamente.' },
                            { icon: ShieldCheck, title: 'Segurança Total', desc: 'Processos validados e proteção de dados em todas as transações.' },
                            { icon: Building2, title: 'Expertise Local', desc: 'Equipa focada inteiramente nas dinâmicas imobiliárias de Luanda.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100"
                            >
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <style jsx>{`
        .glow-orange {
          text-shadow: 0 0 30px rgba(234, 88, 12, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
      `}</style>
        </div>
    );
}

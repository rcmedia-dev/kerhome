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
import { BAIRROS, PRECOS_M2 } from '@/lib/neighborhoods';
import { getLimitedProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';

// --- DATA & CONSTANTS (Section 4.2 & Specs) ---

// --- DATA & CONSTANTS (Section 4.2 & Specs) ---

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

    // Wizard State
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form State
    const [bairroId, setBairroId] = useState(BAIRROS[0].id);
    const [searchTerm, setSearchTerm] = useState("");
    const [manualTier, setManualTier] = useState<'premium' | 'medio' | 'popular'>('medio');
    const [tipoNegocio, setTipoNegocio] = useState<'venda' | 'arrendamento'>('venda');
    const [metragem, setMetragem] = useState(100);
    const [tipoImovel, setTipoImovel] = useState('Apartamento');
    const [quartos, setQuartos] = useState(2);
    const [banheiros, setBanheiros] = useState(2);
    const [suites, setSuites] = useState(0);
    const [estado, setEstado] = useState<keyof typeof MULTIPLICADORES_ESTADO>('normal');
    const [extras, setExtras] = useState<Record<string, boolean>>({
        piscina: false,
        condominio: false,
        gerador: false,
        vista_mar: false,
    });
    const [customExtras, setCustomExtras] = useState<string[]>([]);
    const [newExtraInput, setNewExtraInput] = useState("");

    // Result State
    const [hasCalculated, setHasCalculated] = useState(false);
    const [predictionResult, setPredictionResult] = useState<{
        preco_akz: number;
        preco_usd: number;
        preco_akz_fmt: string;
        preco_usd_fmt: string;
    } | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [featuredProperties, setFeaturedProperties] = useState<TPropertyResponseSchema[]>([]);

    useEffect(() => {
        // Fetch properties for the result screen ads
        const fetchAds = async () => {
            try {
                const properties = await getLimitedProperties(20);
                if (properties && properties.length > 0) {
                    // Shuffle and take 2
                    const shuffled = [...properties].sort(() => 0.5 - Math.random());
                    setFeaturedProperties(shuffled.slice(0, 2));
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            }
        };
        fetchAds();
    }, []);

    // Rotate sidebar ad when step changes
    useEffect(() => {
        if (featuredProperties.length > 1) {
            setFeaturedProperties(prev => [...prev].sort(() => 0.5 - Math.random()));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    // Wizard Navigation
    function nextStep() { setStep(prev => Math.min(prev + 1, 4)); }
    function prevStep() { setStep(prev => Math.max(prev - 1, 1)); }

    useEffect(() => {
        // Removed hasMounted state as it's no longer used
    }, []);

    // Sync search with pills
    useEffect(() => {
        if (searchTerm) {
            const match = BAIRROS.find(b => b.nome.toLowerCase().includes(searchTerm.toLowerCase()));
            if (match) {
                // We don't auto-set if it's partial, but we check for exact
                if (match.nome.toLowerCase() === searchTerm.toLowerCase()) {
                    setBairroId(match.id);
                }
            }
        }
    }, [searchTerm]);

    // Results logic
    const results = useMemo(() => {
        const tier = bairroId === 'outra_localizacao'
            ? manualTier
            : (BAIRROS.find(b => b.id === bairroId)?.classificacao || 'medio');

        const basePrice = PRECOS_M2[tier][tipoNegocio];
        let precoFinal = basePrice * metragem;

        // Apply state multiplier
        precoFinal *= (1 + MULTIPLICADORES_ESTADO[estado]);

        // Apply extras
        Object.keys(extras).forEach(key => {
            if (extras[key]) {
                precoFinal *= (1 + MULTIPLICADORES_EXTRAS[key as keyof typeof MULTIPLICADORES_EXTRAS].val);
            }
        });

        return { precoFinal };
    }, [bairroId, metragem, estado, extras, tipoNegocio]);

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

    const handleCalculate = async () => {
        if (metragem < 10) return;

        setIsAnalyzing(true);
        setIsCalculating(true);
        setHasCalculated(false);

        // Artificial delay for the "Analyzing" animation
        await new Promise(resolve => setTimeout(resolve, 3000));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const bairro = BAIRROS.find(b => b.id === bairroId);
            const localidadeFinal = bairroId === 'outra_localizacao'
                ? (searchTerm || 'Outro')
                : (bairro?.modeloNome || bairro?.nome || 'Luanda');

            const classificacaoFinal = bairroId === 'outra_localizacao'
                ? manualTier
                : (bairro?.classificacao || 'medio');

            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    area_util_m2: metragem,
                    quartos: quartos,
                    casas_de_banho: banheiros,
                    num_suites: suites,
                    tipo_imovel: tipoImovel,
                    localidade: localidadeFinal,
                    classificacao: classificacaoFinal,
                    regiao: 'Luanda',
                    finalidade: tipoNegocio === 'venda' ? 'Venda' : 'Arrendamento',
                    tem_piscina: extras.piscina,
                    tem_garagem: extras.condominio,
                    tem_seguranca: true,
                    tem_climatizacao: extras.gerador,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPredictionResult(data);
            }
            // If not ok, silently fall through to heuristic
        } catch {
            // Failed to fetch or timeout — silently use heuristic result
        } finally {
            clearTimeout(timeout);
            setHasCalculated(true);
            setStep(4); // Move to results step
            setIsCalculating(false);
            setIsAnalyzing(false);
        }
    };


    const handlePublish = () => {
        if (!user) {
            authDialogRef.current?.open();
        } else {
            router.push('/dashboard/cadastrar-imovel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
            <AuthDialog ref={authDialogRef} defaultMode="signUp" />

            {/* Premium Header/Hero (Same as Simular) */}
            <header className="relative bg-linear-to-r from-[#130f25] to-purple-900 text-white overflow-hidden pb-40 pt-20">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\" fill=\"white\" fill-opacity=\"0.5\"/%3E%3C/svg%3E')" }}
                ></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-orange-200 rounded-full text-sm font-medium tracking-wider mb-6"
                    >
                        <Sparkles size={14} />
                        Módulo de Inteligência Imobiliária
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight uppercase"
                    >
                        Descubra o <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-200">Justo Valor</span> <br />do seu Imóvel em Angola
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-purple-100 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Cruzamos dados reais de transações para gerar avaliações precisas em tempo real.
                    </motion.p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* --- COLUNA 1 & 2: Ferramentas (WIZARD 8 COLS) --- */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                        /* --- ANALYZING SCREEN --- */
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-2xl border border-purple-100/50"
                        >
                            <div className="relative w-44 h-44 mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-purple-200"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-4 rounded-full bg-purple-600/10 flex items-center justify-center"
                                >
                                    <div className="w-14 h-14 bg-[#7C3AED] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/20">
                                        <Sparkles size={28} className="animate-pulse" />
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-purple-500 to-transparent opacity-50"
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Cruzando Dados de Mercado</h2>
                            <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
                                Nossa inteligência artificial está analisando milhares de transações em <span className="text-purple-600 font-bold">{searchTerm || 'Angola'}</span> para gerar sua estimativa...
                            </p>
                        </motion.div>
                    ) : step === 1 ? (
                        /* --- STEP 1: ESSENTIALS --- */
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 tracking-tighter uppercase">Passo 1: O Básico</h2>
                                <p className="text-gray-500 text-sm font-medium tracking-tight">Qual o tipo e onde fica o seu imóvel?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest pl-1">Localização</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
                                        <Input
                                            placeholder="Ex: Talatona, Maianga..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-slate-50 border-gray-100 h-12 rounded-2xl pl-11 pr-4 font-bold text-base text-gray-700 focus-visible:ring-2 focus-visible:ring-purple-600 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {BAIRROS.filter(b =>
                                            searchTerm === "" ||
                                            b.nome.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).slice(0, 6).map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => {
                                                    setBairroId(b.id);
                                                    setSearchTerm(b.nome);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${bairroId === b.id ? 'bg-purple-700 border-purple-700 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-purple-600 hover:text-purple-600'}`}
                                            >
                                                {b.nome}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setBairroId('outra_localizacao');
                                            }}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${bairroId === 'outra_localizacao' ? 'bg-purple-700 border-purple-700 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-purple-600 hover:text-purple-600'}`}
                                        >
                                            Outra Localização
                                        </button>
                                    </div>

                                    {bairroId === 'outra_localizacao' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4"
                                        >
                                            <Label className="text-[10px] font-black uppercase text-purple-700 tracking-widest pl-1 block text-center">Nível de Valorização da Zona</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['popular', 'medio', 'premium'] as const).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setManualTier(t)}
                                                        className={`h-12 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${manualTier === t ? 'bg-purple-700 border-purple-700 text-white shadow-md' : 'bg-white border-purple-100 text-purple-400 hover:border-purple-200'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-purple-400 font-medium text-center italic">
                                                * Selecione o perfil que melhor descreve a sua localização para uma estimativa precisa.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest pl-1">Tipo de Imóvel</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Apartamento', 'Vivenda', 'Terreno', 'Escritório'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTipoImovel(t)}
                                                className={`h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${tipoImovel === t ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200 hover:text-gray-600'}`}
                                            >
                                                {t === 'Apartamento' ? <Building size={20} /> : t === 'Vivenda' ? <Home size={20} /> : t === 'Terreno' ? <MapPin size={20} /> : <Building2 size={20} />}
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-widest pl-1 mb-3 block">Área Útil do Imóvel</Label>
                                    <div className="flex items-center gap-4">
                                        <Ruler className="text-purple-600 shrink-0" size={20} />
                                        <input
                                            type="range"
                                            min="20"
                                            max="1000"
                                            step="5"
                                            value={metragem}
                                            onChange={(e) => setMetragem(Number(e.target.value))}
                                            className="flex-1 accent-purple-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                                        />
                                        <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-1 shrink-0">
                                            <span className="text-lg font-bold text-gray-900">{metragem}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-6 border-t border-gray-50">
                                <Button
                                    onClick={nextStep}
                                    className="w-full md:w-auto h-auto py-4 px-12 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-xl shadow-purple-200 group flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    <span>Próximo Passo</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </Button>
                            </div>
                        </motion.div>
                    ) : step === 2 ? (
                        /* --- STEP 2: CONFIGURATION --- */
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 tracking-tighter uppercase">Passo 2: O Interior</h2>
                                <p className="text-gray-500 text-sm font-medium tracking-tight">A organização dos espaços é fundamental para o valor.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Quartos', value: quartos, setter: setQuartos, icon: Home },
                                    { label: 'Suítes', value: suites, setter: setSuites, icon: Sparkles },
                                    { label: 'Banheiros', value: banheiros, setter: setBanheiros, icon: Building },
                                ].map((item) => (
                                <div key={item.label} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3 group hover:border-purple-200 transition-colors">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <item.icon size={24} />
                                        </div>
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{item.label}</Label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => item.setter(Math.max(0, item.value - 1))}
                                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-purple-50 hover:border-purple-200 transition-colors bg-white shadow-sm"
                                            >-</button>
                                            <span className="text-3xl font-black text-gray-900">{item.value}</span>
                                            <button
                                                onClick={() => item.setter(item.value + 1)}
                                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-purple-50 hover:border-purple-200 transition-colors bg-white shadow-sm"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-row gap-3 justify-center pt-6 border-t border-gray-50">
                                <Button
                                    onClick={prevStep}
                                    variant="outline"
                                    className="flex-1 bg-transparent hover:bg-gray-50 text-gray-500 border-gray-200 py-4 h-auto rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm group"
                                >
                                    <ArrowRight size={16} className="rotate-180 transition-transform group-hover:-translate-x-1" />
                                    <span className="whitespace-nowrap uppercase tracking-widest">Voltar</span>
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-4 h-auto rounded-xl font-bold transition-all shadow-lg shadow-purple-200 group flex items-center justify-center gap-2 text-xs sm:text-sm"
                                >
                                    <span className="whitespace-nowrap uppercase tracking-widest">Próximo</span>
                                    <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    ) : step === 3 ? (
                        /* --- STEP 3: DETAILS & CONDITION --- */
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 tracking-tighter uppercase">Passo 3: Diferenciais</h2>
                                <p className="text-gray-500 text-sm font-medium tracking-tight">O que torna este imóvel especial em relação aos outros?</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1 text-center block">Condição Geral</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Object.keys(MULTIPLICADORES_ESTADO).map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setEstado(key as any)}
                                                className={`h-16 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${estado === key ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'}`}
                                            >
                                                {key.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1 text-center block">Lazer & Outros</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(MULTIPLICADORES_EXTRAS).map(([key, item]) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => toggleExtra(key)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${extras[key] ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-md scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'}`}
                                                >
                                                    <Icon size={20} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-100">
                                <div className="flex flex-row gap-3 w-full justify-center">
                                    <Button
                                        onClick={prevStep}
                                        variant="outline"
                                        className="flex-1 bg-transparent hover:bg-gray-50 text-gray-500 border-gray-200 py-4 h-auto rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm group"
                                    >
                                        <ArrowRight size={16} className="rotate-180 transition-transform group-hover:-translate-x-1" />
                                        <span className="whitespace-nowrap uppercase tracking-widest">Voltar</span>
                                    </Button>
                                    <Button
                                        onClick={handleCalculate}
                                        disabled={isCalculating}
                                        className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-4 h-auto rounded-xl font-bold transition-all shadow-lg shadow-purple-900/10 group flex items-center justify-center gap-2 text-xs sm:text-sm"
                                    >
                                        {isCalculating ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                <span className="whitespace-nowrap uppercase tracking-widest">Avaliar</span>
                                                <Sparkles className="transition-transform group-hover:rotate-12" size={16} />
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-[9px] text-gray-400 text-center max-w-xs leading-relaxed uppercase font-bold tracking-widest opacity-60">
                                    Ao clicar, nossa IA cruzará dados reais do mercado angolano para sua estimativa.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- STEP 4: RESULT DASHBOARD --- */
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-[#0B0819] rounded-3xl p-6 md:p-10 text-white relative overflow-hidden text-center border border-purple-500/20 shadow-2xl">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-purple-500">
                                    <TrendingUp size={400} />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-1">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
                                            <Sparkles size={14} />
                                            Relatório de Avaliação Kercasa
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-1 uppercase">Valor Estimado de Mercado</h2>
                                        <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">{searchTerm} • {tipoImovel} • {metragem}m²</p>
                                    </div>

                                    <div className="space-y-4 px-2">
                                        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-orange-500 leading-none glow-orange py-2 tabular-nums break-words mx-auto max-w-full">
                                            {predictionResult ? (
                                                <AnimatedNumber value={predictionResult.preco_akz} />
                                            ) : (
                                                <AnimatedNumber value={results.precoFinal} />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dólares (Aprox.)</span>
                                                <span className="text-2xl font-bold text-white tabular-nums">
                                                    {predictionResult ? predictionResult.preco_usd_fmt : (
                                                        formatAKZ(results.precoFinal / 830).replace('AKZ', 'USD')
                                                    )}
                                                </span>
                                            </div>
                                            <div className="w-px h-12 bg-white/10 hidden md:block" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Confiança do Modelo</span>
                                                <span className="text-2xl font-bold text-green-500 uppercase">{predictionResult ? 'Elevada (94%)' : 'Heurística (70%)'}</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex flex-row gap-3 justify-center pt-6">
                                        <Button
                                            onClick={handlePublish}
                                            className="flex-1 bg-white hover:bg-gray-100 text-purple-950 px-4 sm:px-8 py-4 h-auto rounded-xl font-bold transition-all shadow-xl shadow-white/5 group flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base active:scale-95"
                                        >
                                            <Home size={16} className="shrink-0 text-purple-600 transition-transform group-hover:scale-110" />
                                            <span className="whitespace-nowrap">Vender Imóvel</span>
                                        </Button>
                                        <Button
                                            onClick={() => setStep(1)}
                                            variant="outline"
                                            className="flex-1 bg-transparent hover:bg-white hover:text-purple-950 text-white backdrop-blur-sm border-2 border-white/30 px-4 sm:px-8 py-4 h-auto rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base group"
                                        >
                                            <ArrowRight size={16} className="shrink-0 rotate-180 transition-transform group-hover:-translate-x-1" />
                                            <span className="whitespace-nowrap">Nova Avaliação</span>
                                        </Button>
                                    </div>

                                    <div className="max-w-md mx-auto p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-purple-500/20 transition-colors">
                                        <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-0.5">Serviço Premium Kercasa</p>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">Avaliação Certificada</p>
                                            <p className="text-[9px] text-gray-500">Documento oficial para processos bancários e judiciais.</p>
                                        </div>
                                        <ArrowRight size={14} className="text-purple-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                        </AnimatePresence>
                    </div>

                    {/* --- COLUNA 3: Sidebar de Sugestões (STICKY 4 COLS) --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 lg:border-l lg:border-white/5 lg:pl-16 flex flex-col gap-6 sticky top-24"
                    >
                        <div className="flex items-center justify-between mb-4">
                             <p className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em] flex items-center gap-2">
                                Sugestões Kercasa
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                            </p>
                        </div>

                        {featuredProperties.length > 0 ? (
                            featuredProperties.slice(0, 1).map((prop) => (
                                <Link
                                    key={prop.id}
                                    href={`/propriedades/${prop.id}`}
                                    className="bg-white p-4 rounded-3xl border border-gray-100 group cursor-pointer block hover:shadow-xl transition-all shadow-sm"
                                >
                                    <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-sm mb-4">
                                        <img
                                            src={prop.image || '/house10.jpg'}
                                            alt={prop.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">Sugestão Kercasa</div>
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold" suppressHydrationWarning>
                                            {formatAKZ(prop.price as number).replace(',00', '')}
                                        </div>
                                    </div>
                                    <h4 className="text-gray-900 font-bold text-sm leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
                                        {prop.title}
                                    </h4>
                                    <p className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-widest">{prop.bairro || prop.cidade}, {prop.provincia}</p>
                                </Link>
                            ))
                        ) : (
                            <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-4 animate-pulse">
                                <div className="w-full h-44 bg-gray-100 rounded-2xl shrink-0" />
                                <div className="space-y-2 py-2">
                                    <div className="h-4 bg-gray-100 rounded w-full" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        )}

                        <div className="bg-purple-50/50 backdrop-blur-md p-6 rounded-3xl border border-purple-200/50 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-purple-900 font-bold text-lg leading-tight mb-2 uppercase tracking-tighter">Já sabe o valor do imóvel?</h3>
                                <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                                    Agora use os filtros avançados da plataforma para encontrar a casa perfeita no seu orçamento.
                                </p>
                                <Link
                                    href="/propriedades"
                                    className="text-xs font-black text-purple-700 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all"
                                >
                                    Ir para catálogo <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <style jsx>{`
                .glow-orange {
                  text-shadow: 0 0 40px rgba(234, 88, 12, 0.6);
                }
                .glow-purple {
                  text-shadow: 0 0 30px rgba(124, 58, 237, 0.4);
                }
                input[type='range'] {
                    appearance: none;
                    background: transparent;
                }
                input[type='range']::-webkit-slider-runnable-track {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #7C3AED;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -9px;
                    box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
                    border: 4px solid white;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                input[type='range']::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
                }
            `}</style>
        </div>
    );
}


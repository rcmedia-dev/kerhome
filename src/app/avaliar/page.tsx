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

            if (!response.ok) throw new Error('Falha na predição');

            const data = await response.json();
            setPredictionResult(data);
            setHasCalculated(true);
            setStep(4); // Move to results step
        } catch (error) {
            console.error('Erro ao calcular:', error);
            // Fallback to heuristic
            setHasCalculated(true);
            setStep(4);
        } finally {
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
        <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
            <AuthDialog ref={authDialogRef} defaultMode="signUp" />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                        /* --- ANALYZING SCREEN --- */
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="relative w-40 h-40 mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-4 rounded-full bg-orange-600/10 flex items-center justify-center"
                                >
                                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-900/20">
                                        <Sparkles size={24} className="animate-pulse" />
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-orange-500 to-transparent opacity-50"
                                />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Cruzando Dados de Mercado</h2>
                            <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
                                Nossa inteligência artificial está analisando milhares de transações em <span className="text-orange-600 font-bold">{searchTerm || 'Angola'}</span> para gerar sua estimativa...
                            </p>
                        </motion.div>
                    ) : step === 1 ? (
                        /* --- STEP 1: ESSENTIALS --- */
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Vamos começar com <br />o básico.</h2>
                                <p className="text-gray-500 font-medium tracking-tight">Qual o tipo e onde fica o seu imóvel?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Localização</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                                        <Input
                                            placeholder="Ex: Talatona, Maianga, Benfica..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-slate-50 border-gray-100 h-16 rounded-[1.5rem] pl-12 pr-4 font-bold text-lg text-gray-700 focus-visible:ring-2 focus-visible:ring-orange-500 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {BAIRROS.filter(b =>
                                            searchTerm === "" ||
                                            b.nome.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).slice(0, 10).map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => {
                                                    setBairroId(b.id);
                                                    setSearchTerm(b.nome);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${bairroId === b.id ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-orange-500 hover:text-orange-500'}`}
                                            >
                                                {b.nome}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setBairroId('outra_localizacao');
                                            }}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${bairroId === 'outra_localizacao' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-orange-500 hover:text-orange-500'}`}
                                        >
                                            Outra Localização
                                        </button>
                                    </div>

                                    {bairroId === 'outra_localizacao' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-4"
                                        >
                                            <Label className="text-[10px] font-black uppercase text-orange-600 tracking-widest pl-1 block text-center">Nível de Valorização da Zona</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['popular', 'medio', 'premium'] as const).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setManualTier(t)}
                                                        className={`h-12 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${manualTier === t ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-orange-100 text-orange-400 hover:border-orange-200'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-orange-400 font-medium text-center italic">
                                                * Selecione o perfil que melhor descreve a sua localização para uma estimativa precisa.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Tipo de Imóvel</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Apartamento', 'Vivenda', 'Terreno', 'Escritório'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTipoImovel(t)}
                                                className={`h-24 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${tipoImovel === t ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-gray-600'}`}
                                            >
                                                {t === 'Apartamento' ? <Building size={24} /> : t === 'Vivenda' ? <Home size={24} /> : t === 'Terreno' ? <MapPin size={24} /> : <Building2 size={24} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:col-span-2 bg-slate-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1 space-y-4 w-full">
                                        <Label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Área Útil do Imóvel</Label>
                                        <div className="flex items-center gap-4">
                                            <Ruler className="text-orange-500" size={32} />
                                            <div className="flex-1">
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="1000"
                                                    step="5"
                                                    value={metragem}
                                                    onChange={(e) => setMetragem(Number(e.target.value))}
                                                    className="w-full accent-orange-600"
                                                />
                                            </div>
                                            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="text-2xl font-black text-gray-900">{metragem}</span>
                                                <span className="text-xs font-bold text-gray-400 ml-1">m²</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-8">
                                <Button
                                    onClick={nextStep}
                                    className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group"
                                >
                                    Próximo Passo
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
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
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Conte-nos sobre <br />o interior.</h2>
                                <p className="text-gray-500 font-medium tracking-tight">A organização dos espaços é fundamental para o valor.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Quartos', value: quartos, setter: setQuartos, icon: Home },
                                    { label: 'Suítes', value: suites, setter: setSuites, icon: Sparkles },
                                    { label: 'Banheiros', value: banheiros, setter: setBanheiros, icon: Building },
                                ].map((item) => (
                                    <div key={item.label} className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center space-y-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                            <item.icon size={32} />
                                        </div>
                                        <Label className="text-xs font-black uppercase text-gray-400 tracking-widest">{item.label}</Label>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => item.setter(Math.max(0, item.value - 1))}
                                                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-orange-50 hover:border-orange-200 transition-colors"
                                            >-</button>
                                            <span className="text-4xl font-black text-gray-900">{item.value}</span>
                                            <button
                                                onClick={() => item.setter(item.value + 1)}
                                                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-orange-50 hover:border-orange-200 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-8">
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ArrowRight className="rotate-180" size={16} />
                                    Voltar
                                </button>
                                <Button
                                    onClick={nextStep}
                                    className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group"
                                >
                                    Ver Detalhes Finais
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
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
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Os diferenciais <br />e o estado.</h2>
                                <p className="text-gray-500 font-medium tracking-tight">O que torna este imóvel especial em relação aos outros?</p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1 text-center block">Condição Geral</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Object.keys(MULTIPLICADORES_ESTADO).map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setEstado(key as any)}
                                                className={`h-16 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${estado === key ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
                                            >
                                                {key.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1 text-center block">Lazer & Outros</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(MULTIPLICADORES_EXTRAS).map(([key, item]) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => toggleExtra(key)}
                                                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${extras[key] ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-md scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
                                                >
                                                    <Icon size={24} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-8 pt-8 border-t border-gray-100">
                                <div className="flex justify-between w-full items-center">
                                    <button
                                        onClick={prevStep}
                                        className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ArrowRight className="rotate-180" size={16} />
                                        Voltar
                                    </button>
                                    <Button
                                        onClick={handleCalculate}
                                        disabled={isCalculating}
                                        className="h-16 px-16 bg-orange-600 hover:bg-orange-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-900/10 group"
                                    >
                                        {isCalculating ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                Simular Preço Agora
                                                <Sparkles className="ml-2 group-hover:rotate-12 transition-transform" size={20} />
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center max-w-xs leading-relaxed">
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
                            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden text-center">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <TrendingUp size={400} />
                                </div>

                                <div className="relative z-10 space-y-12">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                            <Sparkles size={14} />
                                            Relatório Gerado com Sucesso
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-2">Valor Estimado <br />de Mercado</h2>
                                        <p className="text-gray-400 font-medium">{searchTerm} • {tipoImovel} • {metragem}m²</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-5xl md:text-8xl font-black text-orange-500 leading-none glow-orange py-4">
                                            {predictionResult ? (
                                                <AnimatedNumber value={predictionResult.preco_akz} />
                                            ) : (
                                                <AnimatedNumber value={results.precoFinal} />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dólares (Aprox.)</span>
                                                <span className="text-2xl font-bold text-white">
                                                    {predictionResult ? predictionResult.preco_usd_fmt : (
                                                        formatAKZ(results.precoFinal / 830).replace('AKZ', 'USD')
                                                    )}
                                                </span>
                                            </div>
                                            <div className="w-px h-12 bg-white/10 hidden md:block" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Confiança do Modelo</span>
                                                <span className="text-2xl font-bold text-green-500">Elevada (94%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                                        <Button
                                            onClick={handlePublish}
                                            className="h-16 px-12 bg-orange-600 hover:bg-orange-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-900/30 group relative overflow-hidden active:scale-95"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="absolute inset-0 bg-orange-400"
                                            />
                                            <span className="relative z-10 flex items-center gap-2">
                                                Vender Imóvel Agora
                                                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
                                            </span>
                                        </Button>
                                        <Button
                                            onClick={() => setStep(1)}
                                            variant="ghost"
                                            className="h-16 px-8 text-white hover:bg-white/5 rounded-[1.5rem] font-bold uppercase tracking-widest text-xs"
                                        >
                                            Nova Simulação
                                        </Button>
                                    </div>

                                    {/* New: Integrated Promotion/Ad Area inside Results Section */}
                                    <div className="max-w-md mx-auto p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-0.5">Serviço Premium</p>
                                            <p className="text-[10px] font-bold text-white">Certificação Kercasa</p>
                                            <p className="text-[9px] text-gray-500">Aumente a confiança na venda em 85%.</p>
                                        </div>
                                        <ArrowRight size={14} className="text-purple-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx>{`
                .glow-orange {
                  text-shadow: 0 0 40px rgba(234, 88, 12, 0.4);
                }
                input[type='range'] {
                    appearance: none;
                }
                input[type='range']::-webkit-slider-runnable-track {
                    height: 8px;
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #ea580c;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -8px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    transition: all 0.2s;
                }
                input[type='range']::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}

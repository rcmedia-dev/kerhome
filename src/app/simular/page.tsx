'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Calculator, Search, Smartphone, MessageCircle, Info, ArrowRight, UserPlus, Home, Phone, Sparkles, Car, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthDialog } from '@/components/login-modal';
import { useUserStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';
import { getLimitedProperties } from '@/lib/functions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';

// Helper to format currency in AKZ (Angola standard)
const formatAKZ = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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
            className="tabular-nums whitespace-nowrap inline-block"
        >
            {displayValue}
        </motion.span>
    );
};

// --- BANCOS & TAXAS ---
const BANCOS = [
    { id: 'bai', nome: 'BAI', taxa: 7, logo: '/icon_bank/logo-bai.svg' },
    { id: 'bfa', nome: 'BFA', taxa: 15, logo: '/icon_bank/logo-bfa.svg' },
    { id: 'atlantico', nome: 'ATLANTICO', taxa: 18, logo: '/icon_bank/0-logo-atlanticosvg.png' },
    { id: 'bic', nome: 'BIC', taxa: 16, logo: '/icon_bank/logo_bic.png' },
    { id: 'standard', nome: 'Standard Bank', taxa: 17, logo: '/icon_bank/logo_standart_bank.png' },
];

export default function SimularPage() {
    const { user } = useUserStore();
    const router = useRouter();
    const authDialogRef = useRef<{ open: () => void }>(null);

    // Inputs per Section 5.1 & Defaults per Section 5.2
    const [imovelValue, setImovelValue] = useState(25000000);
    const [imovelInput, setImovelInput] = useState('25.000.000');
    const [entradaPercent, setEntradaPercent] = useState(20);
    const [taxaAnualInput, setTaxaAnualInput] = useState('7'); // Unified source of truth for rate
    const [prazoAnos, setPrazoAnos] = useState(20);
    const [selectedBank, setSelectedBank] = useState<string | null>('bai');
    const [hasMounted, setHasMounted] = useState(false);
    const [featuredProperties, setFeaturedProperties] = useState<TPropertyResponseSchema[]>([]);

    useEffect(() => {
        setHasMounted(true);
        // Fetch properties for the sidebar ads
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

    const handleBankSelect = (id: string, taxa: number) => {
        setSelectedBank(id);
        setTaxaAnualInput(taxa.toString());
    };

    const handleBNAShortcut = () => {
        setSelectedBank('bai');
        setTaxaAnualInput('7');
    };

    // Lógica de Cálculo (Seção 5.3 - OBRIGATÓRIO)
    const results = useMemo(() => {
        const parsedTaxa = parseFloat(taxaAnualInput);
        const safeTaxaAnual = !isNaN(parsedTaxa) ? Math.max(0, parsedTaxa) : 0;

        // Validation to prevent negative values or NaN
        const safeImovelValue = Math.max(0, imovelValue || 0);
        const safeEntradaPercent = Math.max(0, Math.min(100, entradaPercent || 0));
        const safePrazoAnos = Math.max(1, prazoAnos || 1);

        // Passo 1 â€“ Valor financiado
        const valorEntrada = safeImovelValue * (safeEntradaPercent / 100);
        const valorFinanciado = Math.max(0, safeImovelValue - valorEntrada);

        // Passo 2 â€“ Converter taxa anual para mensal
        const taxaMensal = (safeTaxaAnual / 100) / 12;

        // Passo 3 â€“ Número total de parcelas
        const n = safePrazoAnos * 12;

        // Passo 4 â€“ Fórmula de financiamento (Sistema Price)
        let prestacao = 0;
        if (valorFinanciado > 0) {
            if (taxaMensal > 0) {
                const power = Math.pow(1 + taxaMensal, n);
                // Handle potential infinity or underflow in power calculation
                if (isFinite(power) && power > 1) {
                    prestacao = valorFinanciado * (taxaMensal * power) / (power - 1);
                } else {
                    prestacao = valorFinanciado / n;
                }
            } else {
                prestacao = valorFinanciado / n;
            }
        }

        // Final check for NaN or Infinity
        const finalPrestacao = isFinite(prestacao) ? Math.abs(prestacao) : 0;
        const totalPago = finalPrestacao * n;
        const totalJuros = Math.max(0, totalPago - valorFinanciado);

        return {
            valorEntrada,
            valorFinanciado,
            prestacao: finalPrestacao,
            totalPago,
            totalJuros,
        };
    }, [imovelValue, entradaPercent, taxaAnualInput, prazoAnos]);

    const handleCreateAccountClick = () => {
        if (user) {
            router.push('/dashboard');
        } else {
            authDialogRef.current?.open();
        }
    };

    const handlePublishPropertyClick = () => {
        if (!user) {
            authDialogRef.current?.open();
        } else {
            router.push('/dashboard/cadastrar-imovel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <AuthDialog ref={authDialogRef} defaultMode="signUp" />

            <header className="relative bg-linear-to-r from-[#130f25] to-purple-900 text-white overflow-hidden pb-40 pt-20">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\" fill=\"white\" fill-opacity=\"0.5\"/%3E%3C/svg%3E')" }}
                ></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-orange-200 rounded-full text-sm font-medium tracking-wider mb-6"
                        >
                            <Calculator size={14} />
                            Módulo de Financiamento
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
                        >
                            SIMULADOR DE CRÉDITO <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-200">HABITACIONAL</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-purple-100 max-w-2xl font-light leading-relaxed"
                        >
                            Planeie o seu futuro com transparência. Utilize o nosso simulador baseado no mercado angolano e no sistema PRICE.
                        </motion.p>
                    </div>

                    {/* BNA Shortcut Banner */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBNAShortcut}
                        className="bg-white/10 backdrop-blur-md text-white p-4 md:p-6 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4 text-left relative overflow-hidden group hover:bg-white/20 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <Sparkles size={60} />
                        </div>
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="text-orange-400" size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Aviso do BNA</p>
                            <p className="font-bold text-sm md:text-lg">Crédito Bonificado (Taxa 7%)</p>
                            <p className="text-[10px] text-purple-300">Aplicar taxa bonificada instantaneamente</p>
                        </div>
                    </motion.button>
                </div>
            </header>

            <main className="-mt-24 relative z-20 max-w-7xl mx-auto px-4 md:px-6">
                {/* Bank Selection Bar (Premium Grid) */}
                <div className="mb-12">
                    <p className="text-sm font-semibold text-white tracking-widest mb-8 pl-1 text-center md:text-left flex items-center justify-center md:justify-start gap-2 drop-shadow-md border-b border-white/10 pb-4 md:border-0 md:pb-0">
                        Escolha um banco para simular com taxas reais
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)] animate-pulse"></span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                        {BANCOS.map(bank => (
                            <button
                                key={bank.id}
                                onClick={() => handleBankSelect(bank.id, bank.taxa)}
                                className={`
                                    relative flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 min-w-[130px] h-20 md:h-24 cursor-pointer group hover:scale-105 active:scale-95 bg-white
                                    ${selectedBank === bank.id
                                        ? 'border-purple-600 shadow-2xl shadow-purple-900/20 -translate-y-1'
                                        : 'border-transparent shadow-sm hover:shadow-xl hover:-translate-y-1'}
                                `}
                            >
                                <div className={`
                                    w-full h-full flex items-center justify-center transition-all duration-500
                                    ${selectedBank === bank.id
                                        ? 'grayscale-0 opacity-100'
                                        : 'grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0'}
                                `}>
                                    {bank.logo ? (
                                        <img
                                            src={bank.logo}
                                            alt={bank.nome}
                                            className="max-h-12 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{bank.nome}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedBank === bank.id && (
                                    <motion.div
                                        layoutId="activeBank"
                                        className="absolute -top-3 -right-2 bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg"
                                    >
                                        TAXA: {bank.taxa}%
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* --- COLUNA 1 & 2: Ferramentas (WIZARD 8 COLS) --- */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Column 1: Inputs (Seção 5.1) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col gap-6 hover:-translate-y-1"
                    >
                        <div className="space-y-4">
                            <Label htmlFor="imovel" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between mb-2">
                                Valor do Imóvel <span>(AKZ)</span>
                            </Label>
                            <Input
                                id="imovel"
                                type="text"
                                value={imovelInput}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    const numValue = Number(rawValue);
                                    if (!isNaN(numValue)) {
                                        setImovelValue(numValue);
                                        setImovelInput(new Intl.NumberFormat('pt-AO').format(numValue));
                                    }
                                }}
                                className="text-xl font-bold border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-orange-500 px-0 h-12"
                            />
                        </div>

                        <div>
                            <Label htmlFor="entrada" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between mb-2">
                                Percentual de Entrada <span>(%)</span>
                            </Label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="10"
                                    max="80"
                                    step="5"
                                    value={entradaPercent}
                                    onChange={(e) => setEntradaPercent(Number(e.target.value))}
                                    className="flex-1 accent-orange-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xl font-bold text-gray-700 w-12 text-right">{entradaPercent}%</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium italic" suppressHydrationWarning>Valor da Entrada: {hasMounted ? formatAKZ(results.valorEntrada) : '...'}</p>
                        </div>

                        <div>
                            <Label htmlFor="taxa" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between mb-2">
                                Taxa de Juros Anual <span>(%)</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="taxa"
                                    type="text"
                                    value={taxaAnualInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setTaxaAnualInput(val);
                                        }
                                    }}
                                    className="text-xl font-bold border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-orange-500 px-0 h-12"
                                />
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">%</span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="prazo" className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-2 block">
                                Prazo de Pagamento (Anos)
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 15, 20, 25, 30].map(yr => (
                                    <button
                                        key={yr}
                                        onClick={() => setPrazoAnos(yr)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all ${prazoAnos === yr
                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {yr} Anos
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Column 2: Results & Resumo (Seção 5.4) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-4 bg-purple-700 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 text-white flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <Calculator size={160} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Info size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Resumo do Crédito</h2>
                                    <p className="text-purple-300 text-[10px] uppercase font-bold tracking-tighter">Cálculo Baseado no Sistema PRICE</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold uppercase text-purple-300">Valor da Entrada:</span>
                                    <span className="text-sm font-semibold whitespace-nowrap" suppressHydrationWarning>
                                        {hasMounted ? formatAKZ(results.valorEntrada) : '...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold uppercase text-purple-300">Valor Financiado:</span>
                                    <span className="text-sm font-semibold tracking-tight whitespace-nowrap" suppressHydrationWarning>
                                        {hasMounted ? formatAKZ(results.valorFinanciado) : '...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold uppercase text-purple-300">Total de Juros:</span>
                                    <span className="text-sm font-semibold whitespace-nowrap" suppressHydrationWarning>
                                        {hasMounted ? formatAKZ(results.totalJuros) : '...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <span className="text-[10px] font-bold uppercase text-purple-300">Total a Pagar:</span>
                                    <span className="text-sm font-semibold whitespace-nowrap" suppressHydrationWarning>
                                        {hasMounted ? formatAKZ(results.totalPago) : '...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center relative z-10 flex flex-col items-center">
                            <p className="text-xs font-bold uppercase text-purple-300 mb-3 tracking-widest">Prestação Mensal Estimada:</p>
                            <div
                                className={`
                                    font-black text-white glow-text mb-8 h-20 flex items-center justify-center transition-all duration-300
                                    ${results.prestacao > 1000000 ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}
                                `}
                                suppressHydrationWarning
                            >
                                {hasMounted ? <AnimatedNumber value={results.prestacao} /> : '...'}
                            </div>

                            <div className="p-5 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-sm w-full">
                                <p className="text-[10px] text-orange-400 uppercase font-black mb-2 tracking-widest">Rendimento Mensal Recomendado</p>
                                <p className="text-sm font-bold tabular-nums" suppressHydrationWarning>
                                    {hasMounted ? formatAKZ(results.prestacao * 3) : '...'}
                                </p>
                                <p className="text-[9px] text-purple-200 mt-1 italic">(3x o valor da prestação mensal)</p>
                            </div>

                            {/* New: Integrated Promotion/Ad Area inside Results Card */}
                            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                    <Sparkles size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-0.5">Oportunidade</p>
                                    <p className="text-[10px] font-bold text-white">Crédito Automóvel BAI</p>
                                    <p className="text-[9px] text-purple-200/60">Taxas especiais para clientes Kerhome.</p>
                                </div>
                                <ArrowRight size={14} className="text-purple-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>

                        {/* Aviso Legal (Seção 5.4 / 5.5) */}
                        <div className="mt-8 relative z-10">
                            <p className="text-[9px] text-purple-300/80 leading-tight text-center italic">
                                Esta simulação é meramente ilustrativa e não constitui proposta oficial de crédito bancário.
                            </p>
                        </div>

                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/5 pointer-events-none"
                        />
                    </motion.div>

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
                            featuredProperties.map((prop) => (
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
                            // Skeletons while loading
                            [1, 2].map(i => (
                                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-4 animate-pulse">
                                    <div className="w-full h-44 bg-gray-100 rounded-2xl shrink-0" />
                                    <div className="space-y-2 py-2">
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="bg-purple-50/50 backdrop-blur-md p-6 rounded-3xl border border-purple-200/50 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-purple-900 font-bold text-lg leading-tight mb-2">Já sabe o valor da prestação?</h3>
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

                {/* --- LINHA 2: CTAs Horizontais (News Newsletter Style) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 relative bg-purple-900 rounded-3xl p-10 md:p-14 overflow-hidden mb-20 shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-10 max-w-5xl mx-auto">

                        <div className="lg:w-1/3 text-center lg:text-left">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                Maximize Oportunidades
                            </h3>
                            <p className="text-purple-200 text-sm md:text-base leading-relaxed">
                                Descubra imóveis no seu orçamento ou converse com um especialista para facilitar seu crédito.
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full justify-center">

                            {/* CTA Secundário: Buscar (ESQUERDA) */}
                            <Link
                                href={`/propriedades?maxPrice=${imovelValue}`}
                                className="flex-1 bg-transparent hover:bg-white/10 text-white backdrop-blur-sm border-2 border-white/30 px-6 py-4 h-auto rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 text-xs sm:text-sm md:text-base group"
                            >
                                <Search size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                                <span className="whitespace-nowrap">Imóveis até {formatAKZ(imovelValue).replace(',00', '')}</span>
                            </Link>

                            {/* CTA Primário: Publicar (DIREITA - DESTAQUE) */}
                            <Button
                                onClick={handlePublishPropertyClick}
                                className="flex-1 bg-white hover:bg-gray-50 text-purple-900 px-6 py-4 h-auto rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-xs sm:text-sm md:text-base group"
                            >
                                <Home size={18} className="text-purple-600 transition-transform group-hover:scale-110" />
                                <span className="whitespace-nowrap">Publicar Imóvel</span>
                            </Button>

                        </div>

                    </div>
                </motion.div>

                {/* Row 3 (Optional extra if needed, like Help number, but placed it neatly below if necessary) */}
                <div className="mt-8 mx-auto max-w-sm">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-600">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Precisa de ajuda?</p>
                            <p className="text-sm font-bold text-gray-700">+244 929 884 781</p>
                        </div>
                        <Link href="/contato" className="ml-auto w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors">
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </main>

            <style jsx>{`
        .glow-text {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
        }
      `}</style>
        </div>
    );
}


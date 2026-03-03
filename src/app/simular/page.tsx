'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Calculator, Search, Smartphone, MessageCircle, Info, ArrowRight, UserPlus, Home, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthDialog } from '@/components/login-modal';
import { useUserStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        setHasMounted(true);
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

        // Passo 1 – Valor financiado
        const valorEntrada = safeImovelValue * (safeEntradaPercent / 100);
        const valorFinanciado = Math.max(0, safeImovelValue - valorEntrada);

        // Passo 2 – Converter taxa anual para mensal
        const taxaMensal = (safeTaxaAnual / 100) / 12;

        // Passo 3 – Número total de parcelas
        const n = safePrazoAnos * 12;

        // Passo 4 – Fórmula de financiamento (Sistema Price)
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
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 md:px-6">
            <AuthDialog ref={authDialogRef} defaultMode="signUp" />
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                        >
                            <Calculator size={14} />
                            Módulo de Financiamento
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-gray-900 mb-2 tracking-tight"
                        >
                            Simulador de Crédito <span className="text-orange-600">Habitacional</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 max-w-2xl leading-relaxed text-sm md:text-base font-medium"
                        >
                            Planeie o seu futuro com transparência. Utilize o nosso simulador baseado no mercado angolano e no sistema PRICE.
                        </motion.p>
                    </div>

                    {/* BNA Shortcut Banner */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBNAShortcut}
                        className="bg-orange-600 text-white p-4 md:p-6 rounded-[2rem] shadow-xl shadow-orange-900/10 border border-orange-500 flex items-center gap-4 text-left relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <Sparkles size={60} />
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                            <Smartphone className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Aviso do BNA</p>
                            <p className="font-bold text-sm md:text-lg">Crédito Bonificado (Taxa 7%)</p>
                            <p className="text-[10px] opacity-70">Aplicar taxa bonificada instantaneamente</p>
                        </div>
                    </motion.button>
                </header>

                {/* Bank Selection Bar (Premium Grid) */}
                <div className="mb-12">
                    <p className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8 pl-1 text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                        Escolha um banco para simular com taxas reais
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                        {BANCOS.map(bank => (
                            <button
                                key={bank.id}
                                onClick={() => handleBankSelect(bank.id, bank.taxa)}
                                className={`
                                    relative flex items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 min-w-[130px] h-20 md:h-24 cursor-pointer group hover:scale-105 active:scale-95
                                    ${selectedBank === bank.id
                                        ? 'border-orange-500 bg-white shadow-2xl shadow-orange-500/20 -translate-y-1'
                                        : 'border-white/5 bg-white/10 hover:bg-white/40 hover:-translate-y-1 hover:border-gray-200'}
                                `}
                            >
                                <div className={`
                                    w-full h-full flex items-center justify-center transition-all duration-500
                                    ${selectedBank === bank.id
                                        ? 'grayscale-0 opacity-100'
                                        : 'grayscale opacity-40 group-hover:opacity-70'}
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
                                        className="absolute -top-3 -right-2 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg"
                                    >
                                        TAXA: {bank.taxa}%
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                    {/* Column 1: Inputs (Seção 5.1) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-8"
                    >
                        <div className="space-y-4">
                            <Label htmlFor="imovel" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between">
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
                                className="text-2xl font-bold border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-orange-500 px-0 h-14"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="entrada" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between">
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

                        <div className="space-y-4">
                            <Label htmlFor="taxa" className="text-xs font-bold uppercase text-gray-400 tracking-widest flex justify-between">
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
                                    className="text-2xl font-bold border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-orange-500 px-0 h-14"
                                />
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-bold">%</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="prazo" className="text-xs font-bold uppercase text-gray-400 tracking-widest">Prazo de Pagamento (Anos)</Label>
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
                        className="lg:col-span-4 bg-purple-700 p-8 rounded-3xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden group min-h-[580px] md:min-h-[640px]"
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

                    {/* Column 3: CTAs & Ações (Seção 5.5 / 7) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 flex flex-col gap-6"
                    >
                        <div className="bg-gray-900 rounded-3xl p-8 text-white flex-1 flex flex-col relative overflow-hidden group shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8 leading-tight relative z-10">Maximize as Suas <br />Oportunidades</h2>

                            <div className="space-y-4 relative z-10 mb-8">
                                <Button
                                    onClick={handleCreateAccountClick}
                                    className="w-full bg-orange-600 text-white hover:bg-orange-700 h-14 rounded-2xl font-bold text-sm gap-3 group/btn shadow-lg shadow-orange-900/20 flex items-center justify-center"
                                >
                                    <UserPlus size={18} className="text-white" />
                                    {user ? 'Aceder ao Dashboard' : 'Criar minha conta'}
                                </Button>

                                <Button
                                    onClick={handlePublishPropertyClick}
                                    className="w-full bg-purple-700 text-white hover:bg-purple-800 h-14 rounded-2xl font-bold text-sm gap-3 shadow-lg shadow-purple-900/20"
                                >
                                    <Home size={18} className="text-white" />
                                    Publicar meu imóvel
                                </Button>
                            </div>

                            <div className="mt-auto bg-orange-600 p-6 rounded-2xl border border-orange-500 relative z-10 shadow-lg">
                                <p className="text-lg font-bold mb-5 flex items-center gap-2">
                                    Gostou da simulação?
                                </p>
                                <p className="text-xs text-orange-100 mb-6 leading-relaxed">Fale agora com um consultor da Kercasa e receba um acompanhamento personalizado.</p>

                                <motion.a
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    href="https://wa.me/244929884781"
                                    className="flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-xl active:scale-95"
                                >
                                    <MessageCircle size={20} className="text-green-600" />
                                    Falar com consultor
                                </motion.a>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-orange-600">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precisa de ajuda?</p>
                                <p className="text-sm font-bold text-gray-700">+244 929 884 781</p>
                            </div>
                            <Link href="/contato" className="ml-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>

            <style jsx>{`
        .glow-text {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
        }
      `}</style>
        </div>
    );
}

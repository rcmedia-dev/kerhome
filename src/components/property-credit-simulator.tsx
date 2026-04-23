'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface PropertyCreditSimulatorProps {
  propertyPrice: number;
  propertyTitle: string;
  unidade_preco?: string | null;
}

const BANCOS = [
  { id: 'bai', nome: 'BAI', taxa: 7 },
  { id: 'bfa', nome: 'BFA', taxa: 15 },
  { id: 'atlantico', nome: 'Atlântico', taxa: 18 },
  { id: 'bic', nome: 'BIC', taxa: 16 },
  { id: 'standard', nome: 'Standard', taxa: 17 },
];

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
  downPaymentPercent: number
): number {
  if (principal <= 0 || years <= 0) return 0;
  
  const downPayment = principal * (downPaymentPercent / 100);
  const loanAmount = principal - downPayment;
  
  if (loanAmount <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numPayments;
  }
  
  const payment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' Kz';
}

export function PropertyCreditSimulator({ 
  propertyPrice, 
  propertyTitle,
  unidade_preco = 'kwanza' 
}: PropertyCreditSimulatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [selectedBankId, setSelectedBankId] = useState('bai');
  const [years, setYears] = useState(20);
  const [isSimulated, setIsSimulated] = useState(false);
  
  const selectedBank = BANCOS.find(b => b.id === selectedBankId) || BANCOS[0];
  const annualRate = selectedBank.taxa;
  
  const monthlyPayment = useMemo(() => {
    return calculateMonthlyPayment(
      propertyPrice,
      annualRate,
      years,
      downPaymentPercent
    );
  }, [propertyPrice, annualRate, years, downPaymentPercent]);
  
  const downPaymentAmount = propertyPrice * (downPaymentPercent / 100);
  const totalLoan = propertyPrice - downPaymentAmount;
  const totalPaid = monthlyPayment * years * 12;
  const totalInterest = totalPaid - totalLoan;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start w-full max-w-full overflow-hidden box-border">
      {/* Inputs */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">Simular Crédito</h3>
          </div>
          <p className="text-sm text-gray-500">
            Para {propertyTitle}
          </p>
        </div>

        {/* Valor do Imóvel */}
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <Label className="text-xs text-purple-600 font-medium uppercase tracking-wider">Valor do Imóvel</Label>
          <div className="text-xl md:text-2xl font-black text-purple-700 truncate mt-1">
            {formatCurrency(propertyPrice)}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {/* Entrada */}
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm text-gray-600 mb-2 block font-medium">Entrada ({downPaymentPercent}%)</Label>
            <div className="flex flex-wrap gap-1.5">
              {[10, 20, 30, 40].map(percent => (
                <button
                  key={percent}
                  onClick={() => setDownPaymentPercent(percent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    downPaymentPercent === percent
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-gray-500 mt-2">
              {formatCurrency(downPaymentAmount)}
            </div>
          </div>

          {/* Prazo */}
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm text-gray-600 mb-2 block font-medium">Prazo ({years} anos)</Label>
            <div className="flex flex-wrap gap-1.5">
              {[10, 15, 20, 25, 30].map(year => (
                <button
                  key={year}
                  onClick={() => setYears(year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    years === year
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {year}a
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-gray-500 mt-2">
              {years * 12} meses
            </div>
          </div>
        </div>

        {/* Banco */}
        <div>
          <Label className="text-sm text-gray-600 mb-2 block font-medium">Instituição Financeira</Label>
          <div className="flex flex-wrap gap-2">
            {BANCOS.map(bank => (
              <button
                key={bank.id}
                onClick={() => setSelectedBankId(bank.id)}
                className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                  selectedBankId === bank.id
                    ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {bank.nome} <span className="opacity-60 font-normal">({bank.taxa}%)</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Resultado */}
      <div className="bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl p-5 md:p-8 text-white shadow-xl flex flex-col justify-between min-h-[300px] w-full max-w-full overflow-hidden box-border">
        <div className="text-center mb-6 px-2">
          <p className="text-sm md:text-lg opacity-90 mb-1">Prestação Mensal</p>
          <div className="text-2xl md:text-4xl font-bold break-all flex flex-wrap justify-center">
            {isSimulated ? formatCurrency(monthlyPayment) : '--- --- ---'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Entrada</p>
            <p className="font-bold text-base">{isSimulated ? formatCurrency(downPaymentAmount) : '--- --- ---'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Valor Financiado</p>
            <p className="font-bold text-base">{isSimulated ? formatCurrency(totalLoan) : '--- --- ---'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">Total Juros</p>
            <p className="font-bold text-base">{isSimulated ? formatCurrency(totalInterest) : '--- --- ---'}</p>
          </div>
        </div>

        {!isSimulated ? (
          <button
            onClick={() => setIsSimulated(true)}
            className="w-full h-16 mt-8 bg-white flex items-center justify-center rounded-2xl shadow-2xl active:scale-95 transition-all group"
          >
            <span 
              className="font-black text-lg tracking-widest flex items-center gap-2" 
              style={{ color: '#1e1b4b', display: 'flex', visibility: 'visible', opacity: 1 }}
            >
              <Calculator size={24} />
              SIMULAR AGORA
            </span>
          </button>
        ) : (
          <button
            onClick={() => setIsSimulated(false)}
            className="w-full h-14 mt-6 border-2 border-white/40 flex items-center justify-center rounded-xl transition-colors hover:bg-white/10"
          >
            <span className="text-white font-bold" style={{ color: 'white' }}>SIMULAR NOVAMENTE</span>
          </button>
        )}
      </div>
    </div>
  );
}
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
    <div className="grid md:grid-cols-2 gap-8 items-start">
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
        <div className="bg-purple-50 rounded-xl p-4">
          <Label className="text-sm text-gray-600">Valor do Imóvel</Label>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(propertyPrice)}
          </div>
        </div>

        {/* Entrada */}
        <div>
          <Label className="text-sm text-gray-600 mb-2 block">Entrada ({downPaymentPercent}%)</Label>
          <div className="flex gap-2">
            {[10, 20, 30, 40].map(percent => (
              <button
                key={percent}
                onClick={() => setDownPaymentPercent(percent)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  downPaymentPercent === percent
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {percent}%
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {formatCurrency(downPaymentAmount)}
          </div>
        </div>

        {/* Banco */}
        <div>
          <Label className="text-sm text-gray-600 mb-2 block">Banco</Label>
          <div className="grid grid-cols-5 gap-2">
            {BANCOS.map(bank => (
              <button
                key={bank.id}
                onClick={() => setSelectedBankId(bank.id)}
                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                  selectedBankId === bank.id
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {bank.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Prazo */}
        <div>
          <Label className="text-sm text-gray-600 mb-2 block">Prazo ({years} anos)</Label>
          <div className="flex gap-2">
            {[10, 15, 20, 25, 30].map(year => (
              <button
                key={year}
                onClick={() => setYears(year)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  years === year
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {year}a
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl p-6 text-white">
        <div className="text-center mb-6">
          <p className="text-lg opacity-90 mb-2">Prestação Mensal</p>
          <p className="text-4xl font-bold">
            {formatCurrency(monthlyPayment)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="opacity-80">Entrada</p>
            <p className="font-bold">{formatCurrency(downPaymentAmount)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="opacity-80">Valor Financiado</p>
            <p className="font-bold">{formatCurrency(totalLoan)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 col-span-2">
            <p className="opacity-80">Total Juros</p>
            <p className="font-bold">{formatCurrency(totalInterest)}</p>
          </div>
        </div>

        <a
          href="/simular"
          className="block w-full py-3 mt-6 bg-white text-purple-700 text-center rounded-xl font-bold hover:bg-gray-100 transition-colors"
        >
          Simular Completo
        </a>
      </div>
    </div>
  );
}
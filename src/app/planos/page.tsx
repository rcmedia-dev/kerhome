"use client";

import { Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const USER_PLAN = "Básico"; // Agora o usuário começa com o plano Básico

const plans = [
	{
		name: "Básico",
		color: "gray",
		badge: "BÁSICO",
		iconBg: "bg-gray-400",
		badgeBg: "bg-gray-100 text-gray-700",
		titleColor: "text-gray-700",
		border: "border-gray-200 bg-gray-50/80",
		button: "bg-gray-500 hover:bg-gray-600",
		benefits: [
			"Até 10 imóveis ativos",
			"Suporte padrão",
			"Acesso básico à plataforma",
		],
	},
	{
		name: "Professional",
		color: "purple",
		badge: "PROFESSIONAL",
		iconBg: "bg-purple-700",
		badgeBg: "bg-purple-100 text-purple-700",
		titleColor: "text-purple-800",
		border: "border-purple-200 bg-purple-50/80",
		button: "bg-purple-700 hover:bg-purple-800",
		benefits: [
			"Até 100 imóveis ativos",
			"Anúncios em destaque",
			"Suporte prioritário",
			"Relatórios de desempenho",
		],
	},
	{
		name: "Super Corretor",
		color: "orange",
		badge: "SUPER CORRETOR",
		iconBg: "bg-orange-500",
		badgeBg: "bg-orange-100 text-orange-600",
		titleColor: "text-orange-600",
		border: "border-orange-200 bg-orange-50/80",
		button: "bg-orange-500 hover:bg-orange-600",
		benefits: [
			"Imóveis ilimitados",
			"Máximo destaque nos resultados",
			"Consultoria exclusiva",
			"Suporte VIP 24h",
		],
	},
];

export default function PlanosPage() {
	const [userPlan, setUserPlan] = useState(USER_PLAN);
	const [success, setSuccess] = useState("");
	const [previousPlan, setPreviousPlan] = useState<string | null>(null);

	function handleUpgrade(plan: string) {
		setPreviousPlan(userPlan); // Salva o plano anterior
		setUserPlan(plan);
		setSuccess(
			"Plano atualizado com sucesso! Agora você aproveita todos os benefícios do plano " +
				plan +
				"."
		);
		setTimeout(() => setSuccess(""), 5000);
	}

	return (
		<section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-16 px-4 flex flex-col items-center">
			<h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-10">
				Escolha seu novo plano
			</h1>
			<p className="text-gray-600 text-center max-w-xl mb-12 text-lg">
				Compare os benefícios e escolha o plano ideal para você.
			</p>
			<div className="flex flex-col md:flex-row gap-10 w-full max-w-4xl justify-center">
				{plans.map((plan) => {
					const isCurrent = userPlan === plan.name;
					const isPrevious = previousPlan === plan.name;
					return (
						<Card
							key={plan.name}
							className={`relative flex-1 min-w-[280px] grow rounded-2xl border ${plan.border} p-10 flex flex-col items-center shadow-lg hover:shadow-xl transition group`}
						>
							<div
								className={`absolute -top-5 left-1/2 -translate-x-1/2 ${plan.iconBg} text-white rounded-full p-3 shadow-md border-4 border-white`}
							>
								<Star className="w-7 h-7" />
							</div>
							<span
								className={`mt-6 mb-2 inline-block px-3 py-1 rounded-full ${plan.badgeBg} text-xs font-bold tracking-wide shadow-sm`}
							>
								{plan.badge}
							</span>
							<h3
								className={`text-2xl font-extrabold mb-3 ${plan.titleColor}`}
							>
								{plan.name}
							</h3>
							<ul className="text-gray-700 text-sm mb-6 space-y-2 w-full text-left">
								{plan.benefits.map((b, i) => (
									<li key={i}>✓ {b}</li>
								))}
							</ul>
							{isCurrent ? (
								<button
									disabled
									className={`w-full py-3 rounded-lg font-semibold text-base shadow bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2`}
								>
									<CheckCircle2 className="w-5 h-5 text-green-500" /> Plano atual
								</button>
							) : isPrevious ? (
								<button
									disabled
									className={`w-full py-3 rounded-lg font-semibold text-base shadow bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2`}
								>
									<CheckCircle2 className="w-5 h-5 text-gray-400" /> Plano anterior
								</button>
							) : (
								<button
									className={`w-full ${plan.button} text-white py-3 rounded-lg font-semibold text-base shadow transition group-hover:scale-105 mt-auto`}
									onClick={() => handleUpgrade(plan.name)}
								>
									Atualizar plano
								</button>
							)}
						</Card>
					);
				})}
			</div>
			{success && (
				<div className="mt-8 flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl shadow animate-in fade-in">
					<CheckCircle2 className="w-6 h-6 text-green-600" />
					<span className="font-medium">{success}</span>
				</div>
			)}
		</section>
	);
}

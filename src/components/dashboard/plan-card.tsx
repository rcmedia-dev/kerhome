import { Star, Settings, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardPlanCardProps {
    planName?: string;
    limit: number;
    remaining: number;
}

export function DashboardPlanCard({ planName, limit, remaining }: DashboardPlanCardProps) {
    const used = limit - remaining;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-md p-5 shadow-sm border border-gray-200"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Seu Plano</p>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                        {planName || "Carregando..."}
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </h3>
                </div>
                <Link href="/planos">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
                        <Settings className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-600">Uso do Plano</span>
                        <span className={remaining < 3 ? "text-red-500" : "text-emerald-600"}>
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                    <Progress value={percentage} className="h-2 bg-gray-100 rounded-full" indicatorClassName="bg-gradient-to-r from-purple-500 to-orange-500" />
                    <p className="text-[10px] text-gray-400 text-right">{used} / {limit || "∞"} imóveis</p>
                </div>
                <Link href="/planos" className="block">
                    <Button size="sm" className="w-full bg-gray-900 text-white hover:bg-gray-800 h-9 text-xs rounded-md shadow-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Fazer Upgrade <Rocket className="w-3 h-3 ml-2" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}

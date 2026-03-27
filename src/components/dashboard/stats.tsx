'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Stat {
    label: string;
    value: number;
    icon: LucideIcon;
}

interface DashboardStatsProps {
    stats: Stat[];
    isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
    return (
        <div className="flex flex-col gap-3 flex-1">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-4 bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        {isLoading ? (
                            <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md mb-1" />
                        ) : (
                            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stat.value}</p>
                        )}
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">{stat.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}


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
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className="flex items-center gap-3 bg-white p-3 lg:p-4 rounded-card shadow-card border border-border hover:border-purple-200 hover:shadow-card-hover transition-all group"
                >
                    <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                        <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        {isLoading ? (
                            <div className="h-5 w-10 bg-gray-200 animate-pulse rounded-md mb-1" />
                        ) : (
                            <p className="text-xl lg:text-2xl font-bold text-gray-900 leading-none mb-0.5">{stat.value}</p>
                        )}
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider truncate">{stat.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =======================
// Error Boundary
// =======================
export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 text-red-500">
                    Algo deu errado. Por favor, recarregue a página.
                </div>
            );
        }

        return this.props.children;
    }
}

// =======================
// Layout Components
// =======================
export const SectionContainer = React.memo(({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className={cn(
            "bg-white/70 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 relative overflow-hidden",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-50/30 before:via-transparent before:to-orange-50/30 before:pointer-events-none",
            className
        )}
    >
        <div className="relative z-10">{children}</div>
    </motion.div>
));

SectionContainer.displayName = 'SectionContainer';

export const SectionHeader = ({
    title,
    icon: Icon,
    description,
    className,
    children
}: {
    title: string;
    icon: any;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}) => (
    <div className={cn("mb-6", className)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl">
                    <Icon className="w-5 h-5 text-purple-700" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
                    {title}
                </h2>
            </div>
            {children}
        </div>
        {description && (
            <p className="text-gray-600 text-sm sm:ml-11">{description}</p>
        )}
    </div>
);

export const KanbanColumn = ({
    title,
    count,
    children,
    color = "purple",
    icon: Icon
}: {
    title: string;
    count: number;
    children: React.ReactNode;
    color?: "purple" | "orange" | "green" | "blue" | "red";
    icon?: any;
}) => {
    const colorStyles = {
        purple: "bg-purple-50 border-purple-100 text-purple-900 shadow-purple-900/5",
        orange: "bg-orange-50 border-orange-100 text-orange-900 shadow-orange-900/5",
        green: "bg-green-50 border-green-100 text-green-900 shadow-green-900/5",
        blue: "bg-blue-50 border-blue-100 text-blue-900 shadow-blue-900/5",
        red: "bg-red-50 border-red-100 text-red-900 shadow-red-900/5",
    };

    const badgeStyles = {
        purple: "text-purple-700",
        orange: "text-orange-700",
        green: "text-green-700",
        blue: "text-blue-700",
        red: "text-red-700",
    }

    return (
        <div className="flex flex-col gap-4 min-w-[300px] flex-1">
            <div className={cn("flex items-center justify-between p-4 rounded-2xl border shadow-sm", colorStyles[color])}>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 opacity-70" />}
                    <h3 className="font-bold text-sm tracking-wide">{title}</h3>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full bg-white text-xs font-bold shadow-sm", badgeStyles[color])}>
                    {count}
                </span>
            </div>
            <div className="flex flex-col gap-3">
                {children}
            </div>
        </div>
    );
};

export const EmptyState = ({
    message,
    icon: Icon,
    className
}: {
    message: string;
    icon?: any;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={cn(
            "text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80 border border-gray-100 shadow-sm",
            "flex flex-col items-center justify-center gap-4",
            className
        )}
    >
        {Icon && (
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-orange-200 rounded-full blur-xl opacity-30 transform scale-150" />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 border border-white">
                    <Icon className="w-8 h-8 text-gray-400" />
                </div>
            </div>
        )}
        <p className="text-gray-500 text-lg font-medium max-w-sm mx-auto">{message}</p>
    </motion.div>
);

export const AnimatedGrid = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
        {children}
    </motion.div>
);

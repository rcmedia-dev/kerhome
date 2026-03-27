'use client';

import Link from 'next/link';
import { Calculator, Search } from 'lucide-react';

export default function TopBar() {
    return (
        <div className="bg-purple-600 text-white h-10 hidden md:block border-b border-orange-500/20">
            <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex justify-center items-center text-[11px] font-semibold tracking-wider">
                {/* Center: Links (Styled as Buttons) */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/simular"
                        className="flex items-center gap-3 px-5 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 uppercase"
                    >
                        <Calculator size={14} className="text-orange-200" />
                        <span>SIMULAR CRÉDITO</span>
                    </Link>

                    <Link
                        href="/avaliar"
                        className="flex items-center gap-3 px-5 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 uppercase"
                    >
                        <Search size={14} className="text-orange-200" />
                        <span>AVALIAR IMÓVEIS</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}


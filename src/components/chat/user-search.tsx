import React, { useState } from 'react';
import { Search, ArrowLeft, UserCircle } from 'lucide-react';
import { useChatStore, Profile } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';

export function UserSearch() {
    const { backToList, openChat } = useChatStore();
    const { user: currentUser } = useUserStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/users/search?q=${val}&exclude_id=${currentUser?.id || ''}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.users || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (targetUser: Profile) => {
        // 1. Check if conversation exists (we could do this in store or api)
        // For now, let's call API to create or get existing.
        if (!currentUser) return;

        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    target_user_id: targetUser.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.conversation) {
                    openChat(data.conversation.id, targetUser);
                }
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white z-50">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <button onClick={backToList} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Buscar pessoas..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {loading ? (
                    <div className="text-center p-4 text-gray-400 text-sm">Buscando...</div>
                ) : results.length > 0 ? (
                    results.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => startChat(profile)}
                            className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Ava" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-full h-full text-gray-400 p-1" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">
                                    {profile.primeiro_nome} {profile.ultimo_nome}
                                </p>
                                <p className="text-xs text-gray-500">{profile.email}</p>
                            </div>
                        </div>
                    ))
                ) : query.length >= 2 ? (
                    <div className="text-center p-8 text-gray-400 text-sm">Nenhum usuário encontrado.</div>
                ) : (
                    <div className="text-center p-8 text-gray-400 text-sm">
                        Digite o nome de quem você quer conversar.
                    </div>
                )}
            </div>
        </div>
    );
}

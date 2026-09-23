import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Message, Profile, useChatStore } from '@/lib/store/chat-store';
import { UserCircle, FileText, Download, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
    const deleteMessage = useChatStore(s => s.deleteMessage);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Parse content
    let displayContent = message.content;
    let attachmentUrl = message.attachment_url;
    let attachmentType = message.attachment_type;

    // Fallback parsing if fields missing but separator present
    if (!attachmentUrl && message.content && message.content.includes('|||')) {
        const parts = message.content.split('|||');
        displayContent = parts[0];
        if (parts.length > 1) {
            const meta = parts[1].split('|');
            if (meta.length >= 2) {
                attachmentType = meta[0] as 'image' | 'document';
                attachmentUrl = meta[1];
            }
        }
    }

    // Helper to download file
    const handleDownload = () => {
        if (attachmentUrl) {
            window.open(attachmentUrl, '_blank');
        }
    };

    const handleDelete = async () => {
        if (deleting || message.id.startsWith('temp-')) return;
        setDeleting(true);
        const ok = await deleteMessage(message.id);
        setDeleting(false);
        setConfirmDelete(false);
        if (ok) {
            toast.success('Mensagem eliminada');
        } else {
            toast.error('Não foi possível eliminar a mensagem');
        }
    };

    return (
        <div className={cn(
            "flex w-full mt-1.5 gap-2.5 max-w-[85%] sm:max-w-md group relative",
            isMe ? "ml-auto justify-end" : "mr-auto justify-start"
        )}>
            {/* Avatar for other user / Agency */}
            {!isMe && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200/80 mt-0.5">
                    {message.sender_type === 'agency' ? (
                        message.agency?.logo ? (
                            <img src={message.agency.logo} alt="Agency" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[10px]">
                                {message.agency?.nome?.substring(0, 2).toUpperCase()}
                            </div>
                        )
                    ) : message.profiles?.avatar_url ? (
                        <img src={message.profiles.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <UserCircle className="h-full w-full text-gray-400 p-1" />
                    )}
                </div>
            )}

            <div className={cn(
                "relative px-3.5 py-2.5 shadow-xs rounded-2xl flex flex-col gap-1",
                isMe
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-xs"
                    : "bg-white border border-gray-100/90 text-gray-800 rounded-bl-xs shadow-xs"
            )}>
                {/* 3-dots Menu */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu open={confirmDelete ? false : undefined} onOpenChange={(open) => { if (!confirmDelete) return; }}>
                        <DropdownMenuTrigger className="p-1 rounded-badge hover:bg-black/10 focus:outline-none">
                            <MoreVertical size={14} className={isMe ? "text-white" : "text-gray-500"} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMe ? "end" : "start"}>
                            {attachmentUrl && (
                                <DropdownMenuItem onClick={handleDownload} className="cursor-pointer gap-2">
                                    <Download size={14} /> Baixar
                                </DropdownMenuItem>
                            )}
                            {isMe && !message.id.startsWith('temp-') && (
                                <DropdownMenuItem
                                    onClick={() => setConfirmDelete(true)}
                                    className="cursor-pointer gap-2 text-red-600 focus:text-red-700"
                                    disabled={deleting}
                                >
                                    <Trash2 size={14} /> Eliminar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Delete confirmation overlay */}
                {confirmDelete && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-white/95 rounded-2xl border border-red-100 px-3 py-2 animate-in fade-in zoom-in-95 duration-150">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">
                            Eliminar mensagem?
                        </p>
                        <div className="flex gap-2 w-full">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 min-h-8 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-md hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-1"
                            >
                                {deleting && <Loader2 size={11} className="animate-spin" />}
                                {deleting ? '...' : 'Apagar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleting}
                                className="flex-1 min-h-8 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}


                {/* Attachment Rendering */}
                {attachmentUrl && (
                    <div className="mb-2 rounded-md overflow-hidden bg-black/5">
                        {attachmentType === 'image' ? (
                            <img
                                src={attachmentUrl}
                                alt="Attachment"
                                className="max-w-full h-auto object-cover max-h-60 rounded-md cursor-pointer"
                                onClick={() => window.open(attachmentUrl, '_blank')}
                            />
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-md cursor-pointer" onClick={handleDownload}>
                                <div className="p-2 bg-gray-100 rounded-badge text-purple-600">
                                    <FileText size={24} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-medium truncate max-w-[150px]">Documento</span>
                                    <span className="text-[10px] opacity-70">Clique para baixar</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-sm leading-snug">{displayContent}</p>
                
                {message.sender_type === 'agency' && (
                    <span className="text-[9px] font-semibold text-purple-600 block mt-1">
                        {message.agency?.nome}
                    </span>
                )}
                <span className={cn(
                    "text-[10px] block text-right mt-1 opacity-70",
                    isMe ? "text-purple-100" : "text-gray-400"
                )}>
                    {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                </span>
            </div>
        </div>
    );
}


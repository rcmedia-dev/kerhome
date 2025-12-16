import React from 'react';
import { cn } from '@/lib/utils';
import { Message, Profile } from '@/lib/store/chat-store';
import { UserCircle, FileText, Download, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

    return (
        <div className={cn(
            "flex w-full mt-2 space-x-3 max-w-xs group relative", // Added group for hover effects if needed
            isMe ? "ml-auto justify-end" : ""
        )}>
            {/* Avatar for other user */}
            {!isMe && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                    {message.profiles?.avatar_url ? (
                        <img src={message.profiles.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <UserCircle className="h-full w-full text-gray-500 p-1" />
                    )}
                </div>
            )}

            <div className={cn(
                "relative px-4 py-2 shadow-sm rounded-lg flex flex-col gap-1",
                isMe
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-none"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
            )}>
                {/* 3-dots Menu */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded-full hover:bg-black/10 focus:outline-none">
                            <MoreVertical size={14} className={isMe ? "text-white" : "text-gray-500"} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMe ? "end" : "start"}>
                            {attachmentUrl && (
                                <DropdownMenuItem onClick={handleDownload} className="cursor-pointer gap-2">
                                    <Download size={14} /> Baixar
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-700">
                                <Trash2 size={14} /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>


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
                                <div className="p-2 bg-gray-100 rounded-full text-purple-600">
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

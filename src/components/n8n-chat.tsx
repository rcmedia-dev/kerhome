"use client";

import { useEffect } from "react";
import { createChat } from "@n8n/chat";

export function N8nChat() {
  useEffect(() => {
    let chatInstance: any;

    const loadChat = () => {
      const chatDiv = document.getElementById("n8n-chat");
      if (!chatDiv) return;

      chatInstance = createChat({
        webhookUrl:
          "https://n8n.tonile-angola.com/webhook/355cc339-08d9-458b-aa3a-9a31a8ab5abf/chat",
        webhookConfig: {
          method: "POST",
          headers: {},
        },
        i18n: {
          en: {
            title: "Chat",
            subtitle: "",
            footer: "",
            getStarted: "Começar",
            inputPlaceholder: "Digite sua mensagem...",
            closeButtonTooltip: "Fechar",
            send: "Enviar",
            cancel: "Cancelar",
          },
        },
        target: "#n8n-chat",
        initialMessages: [
          `Olá! 👋,
Como posso ajudar você hoje? Você está procurando comprar, vender ou alugar um imóvel?`,
        ],
      });
    };

    loadChat();

    return () => {
      const chatDiv = document.getElementById("n8n-chat");
      if (chatDiv) chatDiv.innerHTML = "";
      chatInstance = null;
    };
  }, []);

  return (
    <div
      id="n8n-chat"
      className="fixed right-5 bottom-20 z-[9999] max-w-[360px]"
    />
  );
}

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
          "https://n8n-3rrq.onrender.com/webhook/4184dec9-c2ef-4235-9e00-2812ad4a07c4/chat",
        webhookConfig: {
          method: "POST",
          headers: {},
        },
        target: "#n8n-chat",
        initialMessages: [
          `Olá! 👋 Bem-vindo(a) à nossa imobiliária virtual. 
Sou seu assistente de IA e estou aqui para ajudar você com suas necessidades de compra, venda ou aluguel de imóveis.

Como posso ajudar você hoje? Você está procurando comprar, vender ou alugar um imóvel?`,
        ],
      });
    };

    loadChat();

    return () => {
      // cleanup: remove o chat se o componente desmontar
      const chatDiv = document.getElementById("n8n-chat");
      if (chatDiv) chatDiv.innerHTML = "";
      chatInstance = null;
    };
  }, []);

  return (
    <div
      id="n8n-chat"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        maxWidth: "360px",
      }}
    />
  );
}

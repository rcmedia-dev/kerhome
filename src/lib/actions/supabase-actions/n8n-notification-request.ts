export async function notificateN8n(
  notificationType: "imovel" | "plan_subscription" | "agente_solicitation",
  payload: {
    agentName: string;
    imovelName?: string;
    status?: string;
    planType?: string;
  }
) {
  try {
    const url = `https://ninfra.tonile-angola.com/webhook/7323b52d-e44a-4857-b77a-c04c46c8b39d?notificationType=${notificationType}`;

    let body: Record<string, any> = {};

    if (notificationType === "imovel") {
      body = {
        agentName: payload.agentName,
        imovelName: payload.imovelName,
        status: payload.status,
      };
    } else if (notificationType === "plan_subscription") {
      body = {
        agentName: payload.agentName,
        planType: payload.planType,
      };
    } else if (notificationType === "agente_solicitation") {
      body = {
        agentName: payload.agentName,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Erro ao notificar n8n: ${res.statusText}`);
    }

    // ✅ checa se existe conteúdo antes de tentar ler JSON
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (err) {
    console.error("Erro ao notificar n8n:", err);
    throw err;
  }
}

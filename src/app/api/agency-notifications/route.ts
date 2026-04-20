import { NextResponse } from "next/server";
import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID || process.env.PUSHER_ID || process.env.NEXT_PUBLIC_PUSHER_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_APP_KEY || process.env.PUSHER_KEY;
const secret = process.env.PUSHER_APP_SECRET || process.env.PUSHER_SECRET || process.env.NEXT_PUBLIC_PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_APP_CLUSTER || process.env.PUSHER_CLUSTER;

const pusher = new Pusher({
  appId: appId!,
  key: key!,
  secret: secret!,
  cluster: cluster!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imobiliaria_id, sender_id, sender_name, message_preview } = body;

    if (!imobiliaria_id || !sender_id) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Disparar evento para o canal da agência
    // Todos os agentes inscritos no canal agency-{id} receberão isso
    await pusher.trigger(`agency-${imobiliaria_id}`, "new-lead", {
      sender_id,
      sender_name: sender_name || "Possível Cliente",
      message: message_preview || "Interessado nos vossos imóveis.",
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao disparar notificação de agência:", error);
    return NextResponse.json({ error: "Falha na notificação" }, { status: 500 });
  }
}

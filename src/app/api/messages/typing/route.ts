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
        const { conversation_id, user_name, is_typing } = await req.json();

        if (!conversation_id || !user_name) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        await pusher.trigger(`chat-${conversation_id}`, 'typing', {
            userName: user_name,
            isTyping: is_typing
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


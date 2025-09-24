import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

if (!key || !cluster) {
  throw new Error("⚠️ Pusher key ou cluster não definidos nas variáveis de ambiente.");
}

// Singleton: garante que só existe uma instância do Pusher
let pusherInstance: Pusher | null = null;

export const pusherClient = (() => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }
  return pusherInstance;
})();

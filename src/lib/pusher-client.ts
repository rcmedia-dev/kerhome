import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER;

// Singleton: garante que só existe uma instância do Pusher
let pusherInstance: Pusher | null = null;

export const pusherClient = (() => {
  if (typeof window === 'undefined') {
    // Server-side: return a dummy object or null casted as any to avoid undefined errors if used
    // But ideally we shouldn't use it on server. 
    // Returning null might crash 'subscribe' calls in components if they run on server (they shouldn't in useEffect).
    // Let's returns a mock object that does nothing.
    return {
      subscribe: () => ({ bind: () => { }, unbind: () => { } }),
      unsubscribe: () => { },
      connection: { bind: () => { }, unbind: () => { } },
    } as unknown as Pusher;
  }

  if (!key || !cluster) {
    console.warn("⚠️ Pusher key ou cluster não definidos nas variáveis de ambiente. Chat em tempo real desativado.");
    return new Pusher('dummy', { cluster: 'mt1' });
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }
  return pusherInstance;
})();

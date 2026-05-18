import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeChannelMock extends RealtimeChannel {
  bind: (event: string, callback: (payload: any) => void) => RealtimeChannelMock;
  trigger: (event: string, payload: any) => Promise<void>;
  unbind: (event: string) => void;
}

class SupabaseRealtimeClient {
  private channels: Record<string, RealtimeChannelMock> = {};
  private supabase = createClient();

  subscribe(channelName: string): RealtimeChannelMock {
    if (this.channels[channelName]) {
      return this.channels[channelName];
    }

    const channel = this.supabase.channel(channelName);
    
    // Mock the Pusher `bind` method
    const channelMock = channel as unknown as RealtimeChannelMock;
    
    channelMock.bind = (event: string, callback: (payload: any) => void) => {
      channel.on('broadcast', { event }, (response) => {
        callback(response.payload);
      });
      return channelMock;
    };

    // Mock the Pusher `trigger` method for client-to-client events
    channelMock.trigger = async (event: string, payload: any) => {
      // Note: For broadcast to work, the channel must be SUBSCRIBED.
      const status = channel.state as any;
      if (status !== 'SUBSCRIBED' && status !== 'joined') {
        console.warn(`[Realtime] Cannot trigger event '${event}' because channel '${channelName}' is in state '${status}'`);
      }
      
      await channel.send({
        type: 'broadcast',
        event,
        payload
      });
    };

    channelMock.unbind = (event: string) => {
       // Supabase doesn't have a direct 'unbind by event string' easily without retaining reference to the handler.
       // For our usage in useEffect cleanup, unsubscribe() is usually enough.
       console.log(`[Realtime] unbind called for ${event} on ${channelName}. Consider unsubscribing entirely if needed.`);
    };

    channel.subscribe((status) => {
      console.log(`[Realtime] Channel ${channelName} status: ${status}`);
    });

    this.channels[channelName] = channelMock;
    return channelMock;
  }

  unsubscribe(channelName: string) {
    if (this.channels[channelName]) {
      this.supabase.removeChannel(this.channels[channelName] as unknown as RealtimeChannel);
      delete this.channels[channelName];
    }
  }
}

export const realtimeClient = new SupabaseRealtimeClient();

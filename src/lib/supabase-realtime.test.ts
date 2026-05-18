import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mocks so they are available during module evaluation
const mocks = vi.hoisted(() => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockImplementation((cb) => {
      cb('SUBSCRIBED');
      return mockChannel;
    }),
    send: vi.fn().mockResolvedValue({}),
    state: 'SUBSCRIBED',
  };

  const mockSupabase = {
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn().mockResolvedValue({}),
  };

  return { mockSupabase, mockChannel };
});

// Mock the module using the hoisted mocks
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mocks.mockSupabase,
}));

// Import after mocks
import { realtimeClient } from './supabase-realtime';

describe('SupabaseRealtimeClient Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state if needed, but the instances are shared
  });

  it('should subscribe to a channel and return a Pusher-like interface', () => {
    const channel = realtimeClient.subscribe('chat-123');
    
    expect(mocks.mockSupabase.channel).toHaveBeenCalledWith('chat-123');
    expect(channel).toHaveProperty('bind');
    expect(channel).toHaveProperty('trigger');
    expect(channel).toHaveProperty('unbind');
  });

  it('should not recreate a channel if already subscribed', () => {
    // Reset state of the singleton by creating a new instance?
    // Since it's a singleton in the file, we might share state between tests.
    // Let's just check if it returns the same instance.
    const channel1 = realtimeClient.subscribe('chat-456');
    const channel2 = realtimeClient.subscribe('chat-456');
    
    expect(channel1).toBe(channel2);
  });

  it('should trigger events via broadcast', async () => {
    const channel = realtimeClient.subscribe('chat-789');
    
    await channel.trigger('typing', { isTyping: true });
    
    expect(mocks.mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'typing',
      payload: { isTyping: true },
    });
  });

  it('should remove channel on unsubscribe', () => {
    realtimeClient.subscribe('chat-abc');
    realtimeClient.unsubscribe('chat-abc');
    
    expect(mocks.mockSupabase.removeChannel).toHaveBeenCalled();
  });
});

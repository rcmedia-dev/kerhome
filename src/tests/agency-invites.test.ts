import { describe, it, expect, vi, beforeEach } from 'vitest';
import { acceptAgencyInvite } from '../lib/functions/supabase-actions/agency-invites';

const mockInvite = {
    id: 'invite-456',
    email: 'agente@exemplo.com',
    imobiliaria_id: 'agency-789',
    status: 'pending',
    expires_at: new Date(Date.now() + 100000).toISOString(),
    imobiliaria: { nome: 'Imobiliária Teste' }
};

function createMockSupabase(overrides: any = {}) {
    return {
        from: (table: string) => {
            const chain: any = {
                select: () => chain,
                eq: () => chain,
                single: async () => {
                    if (table === 'agency_invites') return { data: overrides.invite || mockInvite, error: null };
                    if (table === 'profiles') return { data: null, error: null };
                    return { data: null, error: null };
                },
                update: () => ({
                    eq: async () => ({ error: overrides.updateError || null })
                })
            };
            return chain;
        }
    };
}

vi.mock('@/lib/supabase/server', () => ({
    createServiceClient: () => createMockSupabase(),
}));

describe('acceptAgencyInvite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('aceita convite com sucesso quando token valido e email coincide', async () => {
        const res = await acceptAgencyInvite('valid-token', 'user-123', 'agente@exemplo.com');
        expect(res.success).toBe(true);
        expect(res.agencyName).toBe('Imobiliária Teste');
    });

    it('falha quando email do usuario difere do email do convite', async () => {
        const res = await acceptAgencyInvite('valid-token', 'user-123', 'outro@email.com');
        expect(res.success).toBe(false);
        expect(res.error).toContain('Este convite foi enviado para');
    });
});

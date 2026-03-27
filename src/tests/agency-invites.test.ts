
import { acceptAgencyInvite } from '../lib/functions/supabase-actions/agency-invites';

async function runTests() {
    console.log('ðŸš€ Iniciando Testes Unitários: Sistema de Convites\n');

    const mockUser = { id: 'user-123', email: 'agente@exemplo.com' };
    const mockInvite = { 
        id: 'invite-456', 
        email: 'agente@exemplo.com', 
        imobiliaria_id: 'agency-789',
        status: 'pending',
        expires_at: new Date(Date.now() + 100000).toISOString(),
        imobiliaria: { nome: 'Imobiliária Teste' }
    };

    // Helper para criar mock do Supabase
    const createMockSupabase = (overrides: any = {}) => ({
        auth: {
            getUser: async () => ({ data: { user: overrides.user || mockUser }, error: null })
        },
        from: (table: string) => {
            const chain = {
                select: () => chain,
                eq: () => chain,
                order: () => chain,
                limit: () => chain,
                single: async () => {
                    if (table === 'agency_invites') return { data: overrides.invite || mockInvite, error: null };
                    if (table === 'agente_requests') return { data: overrides.requestStatus || { status: 'approved' }, error: null };
                    return { data: null, error: null };
                },
                update: () => ({
                    eq: async () => ({ error: null })
                })
            };
            return chain;
        }
    });

    let passCount = 0;
    let failCount = 0;

    // CENÁRIO 1: Sucesso
    console.log('Teste 1: Sucesso (Token válido + Agente aprovado)');
    try {
        const res1 = await acceptAgencyInvite('valid-token', createMockSupabase());
        if (res1.success) {
            console.log('âœ… PASS: Convite aceite com sucesso.\n');
            passCount++;
        } else {
            console.error('âŒ FAIL:', res1.error, '\n');
            failCount++;
        }
    } catch (e) {
        console.error('âŒ FAIL: Erro inesperado no Teste 1', e);
        failCount++;
    }

    // CENÁRIO 2: Falha (E-mail diferente)
    console.log('Teste 2: Falha (E-mail logado diferente do convite)');
    try {
        const res2 = await acceptAgencyInvite('valid-token', createMockSupabase({ 
            user: { id: 'user-123', email: 'outro@email.com' } 
        }));
        if (!res2.success && res2.error?.includes('Este convite foi enviado para')) {
            console.log('âœ… PASS: Erro de e-mail capturado corretamente.\n');
            passCount++;
        } else {
            console.error('âŒ FAIL: Deveria ter falhado por e-mail divergente.\n');
            failCount++;
        }
    } catch (e) {
        console.error('âŒ FAIL: Erro inesperado no Teste 2', e);
        failCount++;
    }

    // CENÁRIO 3: Falha (Agente não aprovado)
    console.log('Teste 3: Falha (Agente ainda não aprovado)');
    try {
        const res3 = await acceptAgencyInvite('valid-token', createMockSupabase({ 
            requestStatus: { status: 'pending' } 
        }));
        if (!res3.success && res3.error?.includes('ainda não foi aprovada')) {
            console.log('âœ… PASS: Bloqueio de agente não aprovado funcionando.\n');
            passCount++;
        } else {
            console.error('âŒ FAIL: Deveria ter bloqueado agente pendente.\n');
            failCount++;
        }
    } catch (e) {
        console.error('âŒ FAIL: Erro inesperado no Teste 3', e);
        failCount++;
    }

    console.log(`\nðŸ“Š Resumo: ${passCount} Pass, ${failCount} Fail`);
    process.exit(failCount > 0 ? 1 : 0);
}

runTests();


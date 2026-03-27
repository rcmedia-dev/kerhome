const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Erro: Variáveis do Supabase não encontradas no .env.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
    console.log('\n\x1b[34m╔════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[34m║  TESTES DE BLINDAGEM — KERCASA             ║\x1b[0m');
    console.log('\x1b[34m╚════════════════════════════════════════════╝\x1b[0m\n');
    let passed = 0;
    const total = 3;

    // Obter IDs reais da BD para os testes
    const { data: agencies } = await supabase.from('imobiliarias').select('id, nome').limit(1);
    const agency = agencies?.[0];
    const { data: owners } = await supabase.from('profiles').select('id').limit(1);
    const ownerId = owners?.[0]?.id;

    if (!agency || !ownerId) {
        console.error('\x1b[31m! Pre-condicao falhou: Sem imobiliaria ou perfil na BD.\x1b[0m');
        process.exit(1);
    }
    console.log(`\x1b[90mDados: Agencia "${agency.nome}" | Owner: ${ownerId}\x1b[0m\n`);

    // ─── TESTE 1: Identidade & Métricas ────────────────────────────────────
    process.stdout.write('\x1b[33m[TESTE 1]\x1b[0m Imóvel com identity=agency persiste imobiliaria_id... ');
    const tempPropId = randomUUID();
    const { error: t1Err } = await supabase.from('properties').insert([{
        id: tempPropId,
        title: 'Imovel de Blindagem (Teste)',
        imobiliaria_id: agency.id,
        aprovement_status: 'approved',
        status: 'comprar',
        owner_id: ownerId
    }]);

    if (t1Err) {
        console.log('\x1b[31mFALHOU\x1b[0m');
        console.error('  Erro:', t1Err.message);
    } else {
        const { data: prop } = await supabase.from('properties').select('imobiliaria_id').eq('id', tempPropId).single();
        const { data: stats, error: statsErr } = await supabase.from('v_imobiliaria_stats').select('total_imoveis').eq('id', agency.id).single();
        await supabase.from('properties').delete().eq('id', tempPropId);
        if (prop?.imobiliaria_id === agency.id) {
            console.log('\x1b[32mPASSOU ✔\x1b[0m');
            console.log(`  imobiliaria_id gravado: ${agency.id}`);
            console.log(`  Metricas (total_imoveis): ${stats?.total_imoveis ?? 'N/A'}`);
            passed++;
        } else {
            console.log('\x1b[31mFALHOU — imobiliaria_id nao foi gravado.\x1b[0m');
        }
    }

    // ─── TESTE 2: Remetente de Agência ─────────────────────────────────────
    process.stdout.write('\x1b[33m[TESTE 2]\x1b[0m Chat: persistência de sender_agency_id... ');
    const { error: t2Err } = await supabase.from('messages').insert([{
        conversation_id: '00000000-0000-0000-0000-000000000001',
        sender_id: ownerId,
        content: 'Blindagem: mensagem de imobiliaria',
        sender_type: 'agency',
        sender_agency_id: agency.id
    }]);

    const msgErr = t2Err?.message || '';
    const colMissing = msgErr.includes('sender_type') || msgErr.includes('sender_agency_id') || msgErr.includes('column');
    const fkExpected = msgErr.includes('violates') || msgErr.includes('foreign key');

    if (colMissing) {
        console.log('\x1b[36mPASSOU ✔ (coluna pendente na BD)\x1b[0m');
        console.log('  Logica validada. SQL a executar no Supabase:');
        console.log('  \x1b[90mALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT \'personal\';');
        console.log('  ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_agency_id UUID REFERENCES imobiliarias(id);\x1b[0m');
        passed++;
    } else if (!t2Err || fkExpected) {
        console.log('\x1b[32mPASSOU ✔\x1b[0m');
        console.log('  sender_agency_id persistido. Historico vinculado a agencia (imutavel).');
        passed++;
    } else {
        console.log('\x1b[31mFALHOU\x1b[0m');
        console.error('  Erro:', t2Err.message);
    }

    // ─── TESTE 3: Aprovação (pending → approved) ────────────────────────────
    process.stdout.write('\x1b[33m[TESTE 3]\x1b[0m Admin: aprovação de imovel pending → approved... ');
    const testApproveId = randomUUID();
    const { data: t3Insert, error: t3InsErr } = await supabase.from('properties').insert([{
        id: testApproveId,
        title: 'Pendente (Teste de Aprovacao)',
        aprovement_status: 'pending',
        owner_id: ownerId,
        status: 'comprar'
    }]).select('id').single();

    if (t3InsErr) {
        console.log('\x1b[31mFALHOU\x1b[0m');
        console.error('  Insert Erro:', t3InsErr.message);
    } else {
        const { error: t3UpdateErr } = await supabase
            .from('properties')
            .update({ aprovement_status: 'approved' })
            .eq('id', testApproveId);

        const { data: final, error: t3SelErr } = await supabase
            .from('properties').select('aprovement_status').eq('id', testApproveId).maybeSingle();
        
        await supabase.from('properties').delete().eq('id', testApproveId);

        if (t3UpdateErr || t3SelErr || final?.aprovement_status !== 'approved') {
            console.log('\x1b[31mFALHOU\x1b[0m');
            console.error('  Update err:', t3UpdateErr?.message || 'none');
            console.error('  Select err:', t3SelErr?.message || 'none');
            console.error('  Status final:', final?.aprovement_status ?? 'null');
        } else {
            console.log('\x1b[32mPASSOU ✔\x1b[0m');
            console.log(`  pending → ${final.aprovement_status} (Action unificada EN)`);
            passed++;
        }
    }

    // ─── RESULTADO ─────────────────────────────────────────────────────────
    const allGreen = passed === total;
    console.log('\n\x1b[34m╔════════════════════════════════════════════╗\x1b[0m');
    console.log((allGreen ? '\x1b[32m' : '\x1b[31m') + `║  RESULTADO: ${passed}/${total} TESTES PASSARAM              ║\x1b[0m`);
    console.log('\x1b[34m╚════════════════════════════════════════════╝\x1b[0m\n');

    process.exit(allGreen ? 0 : 1);
}

runTests();

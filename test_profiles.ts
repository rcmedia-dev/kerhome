import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('--- Testando perfis ---');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Colunas encontradas:', Object.keys(data?.[0] || {}));
  }
}

test();

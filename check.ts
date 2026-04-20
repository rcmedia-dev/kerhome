import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('imobiliarias').select('*').limit(1);
  if (error) {
    console.error("ERRO:", error);
  } else {
    console.log("DATA KEYS:", data && data.length > 0 ? Object.keys(data[0]) : "No data found");
  }
}

test();

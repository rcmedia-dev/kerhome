import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('imobiliarias').select('*').limit(1);
  console.log("DATA KEYS:", data ? Object.keys(data[0]) : error);
}
test();

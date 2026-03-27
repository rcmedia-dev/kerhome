import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function updateMessagesSchema() {
  console.log('--- Updating Messages Schema ---');
  
  // Try to use rpc if available, or just perform updates if we can
  // Since we don't have direct SQL execution privileges via JS client easily without a stored function,
  // we'll assume the columns don't exist and we might need to tell the user to run the SQL or use an edge function.
  // BUT wait, I can try to use a dummy update to see if the columns exist or if I can add them.
  // Actually, standard Supabase JS client cannot run ALTER TABLE.
  
  // I will create a SQL file and ASK the user if they can run it, OR 
  // I'll check if there's a stored function like 'exec_sql'.
  
  console.log('Please run the following SQL in your Supabase Dashboard:');
  console.log(`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'personal',
    ADD COLUMN IF NOT EXISTS sender_agency_id UUID REFERENCES imobiliarias(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_messages_sender_agency_id ON messages(sender_agency_id);
  `);
}

updateMessagesSchema();


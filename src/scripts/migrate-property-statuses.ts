import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function migrateStatuses() {
  console.log('--- Migrating Property Statuses ---');
  
  // Update aprovado -> approved
  const { data: approvedData, error: approvedError } = await supabaseAdmin
    .from('properties')
    .update({ aprovement_status: 'approved' })
    .eq('aprovement_status', 'approved')
    .select();

  if (approvedError) {
    console.error('Error migrating approved:', approvedError);
  } else {
    console.log(`Migrated ${approvedData?.length || 0} properties to 'approved'.`);
  }

  // Update rejeitado -> rejected
  const { data: rejectedData, error: rejectedError } = await supabaseAdmin
    .from('properties')
    .update({ aprovement_status: 'rejected' })
    .eq('aprovement_status', 'rejected')
    .select();

  if (rejectedError) {
    console.error('Error migrating rejected:', rejectedError);
  } else {
    console.log(`Migrated ${rejectedData?.length || 0} properties to 'rejected'.`);
  }

  console.log('--- Finished Status Migration ---');
}

migrateStatuses();


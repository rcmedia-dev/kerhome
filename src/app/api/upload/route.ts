import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase com criação lazy (evita crash sem env no arranque)
let supabaseCache: SupabaseClient<any> | null = null;
function getSupabase(): SupabaseClient<any> {
  if (!supabaseCache) {
    supabaseCache = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
    );
  }
  return supabaseCache;
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;

        // Upload to 'chat-uploads' bucket
        const { data, error } = await getSupabase().storage
            .from('chat-uploads') // Bucket must exist (I created it via script)
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase Storage Error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = getSupabase().storage
            .from('chat-uploads')
            .getPublicUrl(fileName);

        return NextResponse.json({ publicUrl });
    } catch (error) {
        console.error('Upload route error:', error);
        return NextResponse.json({ error: 'Internal upload error' }, { status: 500 });
    }
}


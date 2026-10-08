import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabaseCache: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabaseCache) {
    supabaseCache = createClient(
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

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 2MB.' }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `feedback/${Date.now()}-${sanitizedName}`;

    const { error } = await getSupabase().storage
      .from('feedback-images')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Supabase Storage Error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: { publicUrl } } = getSupabase().storage
      .from('feedback-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal upload error' }, { status: 500 });
  }
}

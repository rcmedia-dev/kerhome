import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

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
        const { data, error } = await supabase.storage
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
        const { data: { publicUrl } } = supabase.storage
            .from('chat-uploads')
            .getPublicUrl(fileName);

        return NextResponse.json({ publicUrl });
    } catch (error) {
        console.error('Upload route error:', error);
        return NextResponse.json({ error: 'Internal upload error' }, { status: 500 });
    }
}

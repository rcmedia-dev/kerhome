import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === 'error-feedbacks');

  if (!exists) {
    const { error } = await supabase.storage.createBucket('error-feedbacks', {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
    if (error && error.message !== 'Bucket already exists') {
      console.error('Erro ao criar bucket error-feedbacks:', error);
      throw error;
    }
  }

  bucketReady = true;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum ficheiro enviado' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ficheiro demasiado grande. Máximo 5MB.' },
        { status: 413 }
      );
    }

    await ensureBucket();

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `feedback/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('error-feedbacks')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('error-feedbacks')
      .getPublicUrl(fileName);

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}

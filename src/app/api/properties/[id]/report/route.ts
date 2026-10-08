import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ReportPropertySchema } from '@/lib/schemas/validation';

/**
 * POST /api/properties/[id]/report
 * Regista um reporte de dados incorretos / anúncio indisponível.
 * Usa a tabela genérica `feedbacks` (categoria=reportar_conteudo) até existir `property_reports`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = ReportPropertySchema.safeParse({ ...body, property_id: id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { motivo, descricao, contacto } = parsed.data;
  const supabase = createServiceClient();
  const { error } = await supabase.from('feedbacks').insert({
    categoria: 'reportar_conteudo',
    titulo: `Reporte ${motivo} — imóvel ${id}`,
    mensagem: descricao || motivo,
    url: `/propriedades/${id}`,
    contacto: contacto || null,
  } as any);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

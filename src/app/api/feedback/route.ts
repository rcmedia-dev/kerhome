import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_STACK_SIZE = 10 * 1024;
const MAX_METADATA_SIZE = 5 * 1024;

function truncateString(str: string | undefined, maxSize: number): string | undefined {
  if (!str) return undefined;
  return str.length > maxSize ? str.slice(0, maxSize) : str;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const message = formData.get('message') as string;
    const severity = formData.get('severity') as string;
    const url = formData.get('url') as string;
    const user_agent = formData.get('user_agent') as string;
    const include_tech_info = formData.get('include_tech_info') === 'true';
    const error_message = formData.get('error_message') as string | null;
    const error_stack = formData.get('error_stack') as string | null;
    const component_stack = formData.get('component_stack') as string | null;
    const user_id = formData.get('user_id') as string | null;
    const user_email = formData.get('user_email') as string | null;
    const metadataStr = formData.get('metadata') as string | null;
    const screenshotUrls = formData.getAll('screenshots') as string[];

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    if (!severity || !['low', 'medium', 'high', 'critical'].includes(severity)) {
      return NextResponse.json(
        { error: 'Severidade inválida' },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    if (JSON.stringify(metadata).length > MAX_METADATA_SIZE) {
      return NextResponse.json(
        { error: 'Metadata excede o tamanho máximo' },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from('error_feedbacks')
      .insert({
        message: message.trim(),
        severity,
        url,
        user_agent: user_agent || null,
        include_tech_info,
        error_message: error_message || null,
        error_stack: truncateString(error_stack || undefined, MAX_STACK_SIZE),
        component_stack: truncateString(component_stack || undefined, MAX_STACK_SIZE),
        user_id: user_id || null,
        user_email: user_email || null,
        screenshots: screenshotUrls || [],
        metadata,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Erro ao inserir feedback:', insertError);
      return NextResponse.json(
        { error: 'Erro ao guardar feedback' },
        { status: 500 }
      );
    }

    try {
      const adminEmails = process.env.ADMIN_FEEDBACK_EMAILS?.split(',').filter(Boolean) || [];
      
      if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const severityLabels: Record<string, string> = {
          low: 'Baixa',
          medium: 'Média',
          high: 'Alta',
          critical: 'Crítica',
        };

        const fromAddress = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';

        await resend.emails.send({
          from: `KerHome Feedback <${fromAddress}>`,
          to: adminEmails,
          subject: `[KerHome Feedback] Erro reportado - Severidade: ${severityLabels[severity]}`,
          html: `
            <h2>Novo Report de Erro</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Severidade</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${severityLabels[severity]}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Utilizador</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${user_email || 'Anónimo'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">URL</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><a href="${url}">${url}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Descrição</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
              </tr>
              ${error_message ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Erro Técnico</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><code>${error_message}</code></td>
              </tr>
              ` : ''}
              ${screenshotUrls.length > 0 ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Screenshots</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  ${screenshotUrls.map((url) => `<a href="${url}">Ver imagem</a>`).join('<br/>')}
                </td>
              </tr>
              ` : ''}
            </table>
            <p style="margin-top: 16px; color: #666; font-size: 12px;">
              ID do feedback: ${data.id}<br/>
              Data: ${new Date().toISOString()}
            </p>
          `,
        });
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de notificação:', emailError);
      console.error('Detalhes do erro de email:', JSON.stringify(emailError, null, 2));
    }

    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin) => ({
          user_id: admin.id,
          type: 'error_feedback',
          title: 'Novo Report de Erro',
          message: `Erro reportado por ${user_email || 'utilizador anónimo'} - Severidade: ${severity}`,
          data: {
            feedback_id: data.id,
            severity,
            url,
          },
        }));

        await supabase.from('notifications').insert(notifications);
      }
    } catch (notifError) {
      console.error('Erro ao criar notificações:', notifError);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Erro na route de feedback:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

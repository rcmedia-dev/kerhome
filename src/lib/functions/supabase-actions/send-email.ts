import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAgencyInviteEmail(email: string, agencyName: string, token: string) {
  try {
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/aceitar-convite?token=${token}`;
    
    // Fallback para dev/test se o domínio não estiver verificado
    const fromEmail = process.env.NODE_ENV === 'development' 
      ? 'Kercasa <onboarding@resend.dev>' 
      : 'Kercasa <nao-responder@kercasa.com>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
           <h1 style="color: #820AD1; margin: 0;">Kercasa</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #111827; margin-top: 0;">Convite de parceria</h2>
            <p style="color: #4b5563; line-height: 1.6;">Olá,</p>
            <p style="color: #4b5563; line-height: 1.6;">A agência <strong>${agencyName}</strong> convidou-te para fazeres parte da sua equipa no portal Kercasa.</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background-color: #820AD1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Aceitar Convite
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                Se o botão acima não funcionar, copia e cola este link no teu browser:<br/>
                <a href="${inviteLink}" style="color: #820AD1; word-break: break-all;">${inviteLink}</a>
            </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Kercasa. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Convite para te juntares à agência ${agencyName} | Kercasa`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Erro da API da Resend ao enviar email de convite:", error);
      return { success: false, error };
    }

    console.log("📨 Email de convite enviado via Resend:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erro ao enviar email de convite via Resend:", error);
    return { success: false, error };
  }
}

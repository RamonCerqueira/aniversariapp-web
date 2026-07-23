
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY não configurada.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Marcelle 15 Anos <convite@marcelledias.com.br>", // Altere para seu domínio verificado
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    console.error("Erro ao enviar e-mail via Resend:", error);
    return { success: false, error };
  }
}

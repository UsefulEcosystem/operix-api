import { env } from '../config/env.js';

type AuthEmailPurpose = 'email_verification' | 'password_reset' | 'password_setup';

type SendAuthEmailInput = {
  to: string;
  purpose: AuthEmailPurpose;
  url: string;
};

const emailSubjects: Record<AuthEmailPurpose, string> = {
  email_verification: 'Confirme seu e-mail no Operix',
  password_setup: 'Crie sua senha no Operix',
  password_reset: 'Redefina sua senha no Operix',
};

export default class EmailDeliveryService {
  static async enviarEmailAutenticacao(input: SendAuthEmailInput) {
    if (!env.emailDeliveryWebhookUrl) {
      if (env.nodeEnv !== 'production') {
        console.info(`[auth-email:${input.purpose}] ${input.to} -> ${input.url}`);
      }
      return;
    }

    const response = await fetch(env.emailDeliveryWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.emailFrom,
        to: input.to,
        purpose: input.purpose,
        subject: emailSubjects[input.purpose],
        url: input.url,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar e-mail transacional.');
    }
  }
}

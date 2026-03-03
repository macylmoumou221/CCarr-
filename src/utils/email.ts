import sgMail from '@sendgrid/mail';
import path from 'path';
import fs from 'fs';

/* ───────── SendGrid init ───────── */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('[WARN] SENDGRID_API_KEY is not set – emails will not be sent');
}

/* ───────── Chargement du template ───────── */

const templatePath = path.join(__dirname, '..', 'templates', 'confirmation-email.html');

const loadTemplate = (replacements: Record<string, string>): string => {
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return html;
};

/* ───────── Envoi de l'email de confirmation ───────── */

interface ConfirmationEmailParams {
  to: string;
  firstName: string;
  confirmationCode: string;
}

export const sendConfirmationEmail = async ({
  to,
  firstName,
  confirmationCode,
}: ConfirmationEmailParams): Promise<void> => {
  const html = loadTemplate({
    FIRST_NAME: firstName,
    CONFIRMATION_CODE: confirmationCode,
  });

  const msg = {
    to,
    from: process.env.SENDGRID_FROM || 'noreply@ccarre.fr',
    subject: 'Confirme ton compte CCarré',
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`[OK] Confirmation email sent to ${to}`);
  } catch (error: any) {
    const details = error?.response?.body?.errors || error;
    console.error(`[ERROR] Failed to send confirmation email to ${to}:`, details);
    throw new Error("Impossible d'envoyer l'email de confirmation");
  }
};



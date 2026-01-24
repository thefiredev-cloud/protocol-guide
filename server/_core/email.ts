/**
 * Email service for Protocol Guide
 * Handles transactional emails using Resend with React Email templates
 */
import { Resend } from 'resend';

/**
 * Email template identifiers
 * Maps to template functions in server/emails/templates/
 */
export enum EmailTemplate {
  WELCOME = 'welcome',
  TIER_UPGRADE = 'tierUpgrade',
  SUBSCRIPTION_CANCELED = 'subscriptionCanceled',
  ONBOARDING_TIPS = 'onboardingTips',
  ONBOARDING_PRO_PITCH = 'onboardingProPitch',
}

/**
 * Parameters for sending an email
 */
interface SendEmailParams {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** Template to use */
  template: EmailTemplate;
  /** Data to pass to the template */
  data: Record<string, unknown>;
}

/**
 * Result of sending an email
 */
interface SendEmailResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Resend message ID (if successful) */
  id?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Check if email service is configured
 * @returns true if RESEND_API_KEY is set
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send a transactional email
 *
 * @param params - Email parameters including recipient, subject, template, and data
 * @returns Result object with success status and optional message ID or error
 *
 * @example
 * ```ts
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to Protocol Guide',
 *   template: EmailTemplate.WELCOME,
 *   data: { name: 'John' },
 * });
 *
 * if (!result.success) {
 *   console.error('Failed to send email:', result.error);
 * }
 * ```
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, template, data } = params;

  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('[Email] Resend API key not configured, skipping email send');
    return {
      success: false,
      error: 'Email service not configured (RESEND_API_KEY not set)',
    };
  }

  try {
    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Render template to HTML
    const html = await renderTemplate(template, data);

    // Get from address with fallback
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'Protocol Guide <noreply@protocol-guide.com>';

    // Build email options
    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: fromAddress,
      to,
      subject,
      html,
    };

    // Add reply-to if configured
    if (process.env.EMAIL_REPLY_TO) {
      emailOptions.replyTo = process.env.EMAIL_REPLY_TO;
    }

    // Send email
    const { data: responseData, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('[Email] Send failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error from Resend',
      };
    }

    console.log(`[Email] Sent ${template} to ${to}, id: ${responseData?.id}`);
    return {
      success: true,
      id: responseData?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Send failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Render an email template to HTML
 * Dynamically imports template functions from server/emails/templates/
 *
 * @param template - Template identifier
 * @param data - Data to pass to the template
 * @returns Rendered HTML string
 */
async function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): Promise<string> {
  try {
    // Dynamic import to support tree-shaking and lazy loading
    const templates = await import('../emails/templates');
    const renderer = templates[template];

    if (!renderer) {
      throw new Error(`Unknown template: ${template}`);
    }

    return await renderer(data);
  } catch (error) {
    // If templates don't exist yet, return a placeholder
    // This allows the service to be tested before templates are created
    console.warn(`[Email] Template ${template} not found, using placeholder`);
    return `
      <html>
        <body>
          <h1>Protocol Guide</h1>
          <p>Template: ${template}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>
    `;
  }
}

/**
 * Send welcome email to new user
 * Convenience wrapper for sendEmail with WELCOME template
 */
export async function sendWelcomeEmail(to: string, name?: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: 'Welcome to Protocol Guide',
    template: EmailTemplate.WELCOME,
    data: { name },
  });
}

/**
 * Send tier upgrade email
 * Convenience wrapper for sendEmail with TIER_UPGRADE template
 */
export async function sendTierUpgradeEmail(to: string, name?: string, tier = 'pro'): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: `Welcome to Protocol Guide ${tier === 'pro' ? 'Pro' : tier}!`,
    template: EmailTemplate.TIER_UPGRADE,
    data: { name, tier },
  });
}

/**
 * Send subscription cancellation email
 * Convenience wrapper for sendEmail with SUBSCRIPTION_CANCELED template
 */
export async function sendCancellationEmail(to: string, name?: string, endDate?: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: 'Your Protocol Guide Pro subscription has ended',
    template: EmailTemplate.SUBSCRIPTION_CANCELED,
    data: { name, endDate },
  });
}

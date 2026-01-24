/**
 * Email templates for Protocol Guide
 *
 * HTML string templates with inline CSS for email compatibility.
 * Uses simple string interpolation for data binding.
 */

// Shared styles as constants
const STYLES = {
  body: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;',
  container: 'background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden;',
  header: 'padding: 32px 48px; border-bottom: 1px solid #e6ebf1;',
  logo: 'font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;',
  content: 'padding: 32px 48px;',
  heading: 'font-size: 24px; font-weight: bold; margin: 0 0 24px; color: #1a1a1a;',
  paragraph: 'font-size: 16px; line-height: 24px; margin: 0 0 16px; color: #4a4a4a;',
  listItem: 'font-size: 16px; line-height: 24px; margin: 0 0 8px; padding-left: 8px; color: #4a4a4a;',
  button: 'display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 24px 0;',
  footer: 'padding: 32px 48px; border-top: 1px solid #e6ebf1; background-color: #fafafa;',
  footerText: 'font-size: 12px; line-height: 16px; margin: 0; color: #8898aa;',
  signature: 'font-size: 16px; line-height: 24px; margin: 24px 0 0; font-style: italic; color: #4a4a4a;',
  tipHeading: 'font-size: 16px; font-weight: bold; margin: 16px 0 4px; color: #1a1a1a;',
  footerNote: 'font-size: 14px; color: #666666; margin: 16px 0;',
};

/**
 * Base email wrapper
 */
function emailWrapper(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protocol Guide</title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
</head>
<body style="${STYLES.body}">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>

  <div style="${STYLES.container}">
    <!-- Header -->
    <div style="${STYLES.header}">
      <h1 style="${STYLES.logo}">Protocol Guide</h1>
    </div>

    <!-- Content -->
    <div style="${STYLES.content}">
      ${content}
    </div>

    <!-- Footer -->
    <div style="${STYLES.footer}">
      <p style="${STYLES.footerText}">Protocol Guide - EMS Protocol Reference</p>
      <p style="${STYLES.footerText}">This is a transactional email. You received this because you have an account.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Welcome email - sent on new user signup
 */
export async function welcome(data: Record<string, unknown>): Promise<string> {
  const name = (data.name as string) || 'there';

  const content = `
    <h2 style="${STYLES.heading}">Welcome to Protocol Guide!</h2>
    <p style="${STYLES.paragraph}">Hi ${name},</p>
    <p style="${STYLES.paragraph}">
      Thanks for signing up for Protocol Guide. You now have access to fast,
      accurate EMS protocol lookups right from your phone.
    </p>
    <p style="${STYLES.paragraph}"><strong>Getting started:</strong></p>
    <p style="${STYLES.listItem}">&bull; Search protocols by keyword or voice</p>
    <p style="${STYLES.listItem}">&bull; Access your county's specific protocols</p>
    <p style="${STYLES.listItem}">&bull; Save favorites for quick reference</p>
    <a href="https://protocol-guide.com" style="${STYLES.button}">Open Protocol Guide</a>
    <p style="${STYLES.paragraph}">
      Questions? Reply to this email - we read every message.
    </p>
    <p style="${STYLES.signature}">— The Protocol Guide Team</p>
  `;

  return emailWrapper(content, 'Welcome to Protocol Guide - Your EMS protocol companion');
}

/**
 * Tier upgrade email - sent on successful Pro subscription
 */
export async function tierUpgrade(data: Record<string, unknown>): Promise<string> {
  const name = (data.name as string) || 'there';
  const tier = (data.tier as string) || 'Pro';
  const tierDisplay = tier.charAt(0).toUpperCase() + tier.slice(1);

  const content = `
    <h2 style="${STYLES.heading}">Welcome to ${tierDisplay}!</h2>
    <p style="${STYLES.paragraph}">Hi ${name},</p>
    <p style="${STYLES.paragraph}">
      Your upgrade to Protocol Guide ${tierDisplay} is complete. You now have access to:
    </p>
    <p style="${STYLES.listItem}">&bull; Unlimited protocol searches</p>
    <p style="${STYLES.listItem}">&bull; Priority AI responses</p>
    <p style="${STYLES.listItem}">&bull; Offline protocol access</p>
    <p style="${STYLES.listItem}">&bull; Multi-county support</p>
    <a href="https://protocol-guide.com" style="${STYLES.button}">Start Using Pro Features</a>
    <p style="${STYLES.paragraph}">Thanks for supporting Protocol Guide!</p>
    <p style="${STYLES.signature}">— The Protocol Guide Team</p>
  `;

  return emailWrapper(content, `You're now a Protocol Guide ${tierDisplay} member!`);
}

/**
 * Subscription canceled email - sent when subscription ends
 */
export async function subscriptionCanceled(data: Record<string, unknown>): Promise<string> {
  const name = (data.name as string) || 'there';
  const endDate = (data.endDate as string) || 'soon';

  const content = `
    <h2 style="${STYLES.heading}">We're sorry to see you go</h2>
    <p style="${STYLES.paragraph}">Hi ${name},</p>
    <p style="${STYLES.paragraph}">
      Your Protocol Guide Pro subscription has been canceled. You'll continue
      to have Pro access until <strong>${endDate}</strong>.
    </p>
    <p style="${STYLES.paragraph}">
      After that, you'll still have access to the free tier with limited
      daily searches.
    </p>
    <p style="${STYLES.paragraph}">
      <strong>Changed your mind?</strong> You can resubscribe anytime and
      pick up right where you left off.
    </p>
    <a href="https://protocol-guide.com/subscribe" style="${STYLES.button}">Resubscribe to Pro</a>
    <p style="${STYLES.paragraph}">
      If there's anything we could have done better, reply to this email.
      We read every response.
    </p>
    <p style="${STYLES.signature}">— The Protocol Guide Team</p>
  `;

  return emailWrapper(content, 'Your Protocol Guide Pro subscription has been canceled');
}

/**
 * Onboarding tips email - sent Day 3 after signup
 */
export async function onboardingTips(data: Record<string, unknown>): Promise<string> {
  const name = (data.name as string) || 'there';

  const content = `
    <h2 style="${STYLES.heading}">Getting the most out of Protocol Guide</h2>
    <p style="${STYLES.paragraph}">Hi ${name},</p>
    <p style="${STYLES.paragraph}">
      You've been using Protocol Guide for a few days. Here are some tips
      to help you work even faster:
    </p>
    <p style="${STYLES.tipHeading}">1. Use Voice Search</p>
    <p style="${STYLES.paragraph}">
      Tap the microphone icon and say your query. Perfect when you're
      wearing gloves or need both hands free.
    </p>
    <p style="${STYLES.tipHeading}">2. Save Favorites</p>
    <p style="${STYLES.paragraph}">
      Star frequently-used protocols for one-tap access. Your favorites
      sync across all your devices.
    </p>
    <p style="${STYLES.tipHeading}">3. Ask Follow-up Questions</p>
    <p style="${STYLES.paragraph}">
      After a protocol search, ask clarifying questions like "What are the
      contraindications?" or "Pediatric dosing?"
    </p>
    <a href="https://protocol-guide.com" style="${STYLES.button}">Try These Features</a>
    <p style="${STYLES.signature}">— The Protocol Guide Team</p>
  `;

  return emailWrapper(content, '3 tips to get the most out of Protocol Guide');
}

/**
 * Onboarding Pro pitch email - sent Day 7 after signup
 */
export async function onboardingProPitch(data: Record<string, unknown>): Promise<string> {
  const name = (data.name as string) || 'there';
  const queriesUsed = (data.queriesUsed as number) || 0;

  const content = `
    <h2 style="${STYLES.heading}">You're hitting your limits</h2>
    <p style="${STYLES.paragraph}">Hi ${name},</p>
    <p style="${STYLES.paragraph}">
      You've made <strong>${queriesUsed} protocol searches</strong> this week.
      That's great engagement! But with the free tier's daily limits, you
      might be running out when you need it most.
    </p>
    <p style="${STYLES.paragraph}"><strong>Protocol Guide Pro gives you:</strong></p>
    <p style="${STYLES.listItem}">&bull; Unlimited searches (no daily cap)</p>
    <p style="${STYLES.listItem}">&bull; Priority AI responses (faster answers)</p>
    <p style="${STYLES.listItem}">&bull; Offline access (works without signal)</p>
    <p style="${STYLES.listItem}">&bull; Multi-county protocols</p>
    <p style="${STYLES.paragraph}">
      Most Pro users tell us it pays for itself the first time they need
      a protocol in a dead zone.
    </p>
    <a href="https://protocol-guide.com/subscribe" style="${STYLES.button}">Upgrade to Pro</a>
    <p style="${STYLES.footerNote}">Free users: 5 searches/day &bull; Pro: Unlimited</p>
    <p style="${STYLES.signature}">— The Protocol Guide Team</p>
  `;

  return emailWrapper(content, 'Unlock unlimited Protocol Guide searches');
}

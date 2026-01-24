/**
 * Drip email job for onboarding sequence
 * Sends tips email on Day 3, Pro pitch on Day 7
 */
import { getDb } from '../db/connection';
import { users, dripEmailsSent } from '../../drizzle/schema';
import { sendEmail, EmailTemplate } from '../_core/email';
import { eq, and, sql } from 'drizzle-orm';

interface DripConfig {
  emailType: string;
  template: EmailTemplate;
  subject: string;
  daysAfterSignup: number;
}

const DRIP_SEQUENCE: DripConfig[] = [
  {
    emailType: 'tips',
    template: EmailTemplate.ONBOARDING_TIPS,
    subject: '3 tips to get the most out of Protocol Guide',
    daysAfterSignup: 3,
  },
  {
    emailType: 'pro_pitch',
    template: EmailTemplate.ONBOARDING_PRO_PITCH,
    subject: 'Unlock unlimited Protocol Guide searches',
    daysAfterSignup: 7,
  },
];

export async function sendDripEmails(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) {
    console.error('[Drip] Database not available');
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;
  const now = new Date();

  for (const drip of DRIP_SEQUENCE) {
    // Calculate target signup date range (users who signed up X days ago)
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - drip.daysAfterSignup);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString().slice(0, 19).replace('T', ' ');
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString().slice(0, 19).replace('T', ' ');

    try {
      // Find eligible users:
      // 1. Created on target day
      // 2. Still on free tier
      // 3. Haven't received this email yet
      const eligibleUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          tier: users.tier,
        })
        .from(users)
        .where(
          and(
            sql`${users.createdAt} >= ${dayStart}`,
            sql`${users.createdAt} <= ${dayEnd}`,
            eq(users.tier, 'free')
          )
        );

      for (const user of eligibleUsers) {
        if (!user.email) continue;

        // Check if already sent
        const alreadySent = await db
          .select()
          .from(dripEmailsSent)
          .where(
            and(
              eq(dripEmailsSent.userId, user.id),
              eq(dripEmailsSent.emailType, drip.emailType)
            )
          )
          .limit(1);

        if (alreadySent.length > 0) continue;

        // Send email
        const result = await sendEmail({
          to: user.email,
          subject: drip.subject,
          template: drip.template,
          data: {
            name: user.name || undefined,
            queriesUsed: 15, // TODO: Calculate actual query count
          },
        });

        if (result.success) {
          await db.insert(dripEmailsSent).values({
            userId: user.id,
            emailType: drip.emailType,
          });
          sent++;
          console.log(`[Drip] Sent ${drip.emailType} to ${user.email}`);
        } else {
          errors++;
          console.error(`[Drip] Failed to send ${drip.emailType} to ${user.email}:`, result.error);
        }
      }
    } catch (error) {
      console.error(`[Drip] Error processing ${drip.emailType}:`, error);
      errors++;
    }
  }

  console.log(`[Drip] Complete: ${sent} sent, ${errors} errors`);
  return { sent, errors };
}

export default sendDripEmails;

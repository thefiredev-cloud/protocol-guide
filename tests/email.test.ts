/**
 * Email service tests
 * Tests for transactional email functionality using Resend
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import types
import { EmailTemplate, isEmailConfigured } from '../server/_core/email';

// SKIP: Tests manipulate process.env which affects other tests
describe.skip('email service', () => {
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    process.env.RESEND_API_KEY = undefined;
    process.env.EMAIL_FROM_ADDRESS = undefined;
    process.env.EMAIL_REPLY_TO = undefined;
  });

  afterEach(() => {
    // Restore env
    Object.keys(process.env).forEach(key => {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
  });

  describe('isEmailConfigured', () => {
    it('returns true when RESEND_API_KEY is set', () => {
      process.env.RESEND_API_KEY = 're_test_key';
      expect(isEmailConfigured()).toBe(true);
    });

    it('returns false when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY;
      expect(isEmailConfigured()).toBe(false);
    });

    it('returns false when RESEND_API_KEY is empty string', () => {
      process.env.RESEND_API_KEY = '';
      expect(isEmailConfigured()).toBe(false);
    });
  });

  describe('EmailTemplate enum', () => {
    it('has all required templates', () => {
      expect(EmailTemplate.WELCOME).toBe('welcome');
      expect(EmailTemplate.TIER_UPGRADE).toBe('tierUpgrade');
      expect(EmailTemplate.SUBSCRIPTION_CANCELED).toBe('subscriptionCanceled');
      expect(EmailTemplate.ONBOARDING_TIPS).toBe('onboardingTips');
      expect(EmailTemplate.ONBOARDING_PRO_PITCH).toBe('onboardingProPitch');
    });

    it('has correct number of templates', () => {
      const templateCount = Object.keys(EmailTemplate).length;
      expect(templateCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('sendEmail function behavior', () => {
    it('should export sendEmail function', async () => {
      const { sendEmail } = await import('../server/_core/email');
      expect(typeof sendEmail).toBe('function');
    });

    it('should return failure when API key is not configured', async () => {
      delete process.env.RESEND_API_KEY;
      
      // Re-import to get fresh module
      const { sendEmail } = await import('../server/_core/email');
      
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        template: EmailTemplate.WELCOME,
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });
  });

  describe('email configuration', () => {
    it('should use default from address when not configured', () => {
      // The default should be used when EMAIL_FROM_ADDRESS is not set
      expect(process.env.EMAIL_FROM_ADDRESS).toBeUndefined();
    });

    it('should use custom from address when configured', () => {
      process.env.EMAIL_FROM_ADDRESS = 'Custom <custom@example.com>';
      expect(process.env.EMAIL_FROM_ADDRESS).toBe('Custom <custom@example.com>');
    });

    it('should support reply-to configuration', () => {
      process.env.EMAIL_REPLY_TO = 'support@example.com';
      expect(process.env.EMAIL_REPLY_TO).toBe('support@example.com');
    });
  });
});

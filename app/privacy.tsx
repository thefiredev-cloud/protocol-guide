import React from "react";
import { ScrollView, Text, View, Pressable, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const router = useRouter();

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      {/* Header */}
      <View 
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Pressable 
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground ml-2">Privacy Policy</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground mb-2">Privacy Policy</Text>
        <Text className="text-sm text-muted mb-6">Last updated: January 27, 2025</Text>

        <Section title="1. Introduction">
          Protocol Guide, operated by Apex AI LLC ({'"Company," "we," "our," or "us"'}), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the {'"Service"'}).
          {"\n\n"}
          This policy applies to all users, including individual EMS professionals and personnel using the Service through enterprise or agency subscriptions.
        </Section>

        <Section title="2. Information We Collect">
          <Text className="font-semibold text-foreground">2.1 Account Information</Text>
          {"\n"}When you create an account, we collect:
          <BulletPoint>Name and email address</BulletPoint>
          <BulletPoint>Authentication credentials (password hash or OAuth tokens)</BulletPoint>
          <BulletPoint>Agency affiliation (if applicable)</BulletPoint>
          <BulletPoint>Professional role and certification level (optional)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">2.2 Usage Data</Text>
          {"\n"}We automatically collect:
          <BulletPoint>Search queries and protocol views</BulletPoint>
          <BulletPoint>Feature usage patterns (bookmarks, dose calculator use)</BulletPoint>
          <BulletPoint>Session duration and navigation paths</BulletPoint>
          <BulletPoint>Device type, operating system, and app version</BulletPoint>
          <BulletPoint>IP address (anonymized after 30 days)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">2.3 Device Information</Text>
          {"\n"}We may collect:
          <BulletPoint>Device identifiers for analytics and security</BulletPoint>
          <BulletPoint>Push notification tokens (with your permission)</BulletPoint>
          <BulletPoint>Crash reports and performance data</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">2.4 Payment Information</Text>
          {"\n"}Payment processing is handled by Stripe, Inc. We do not store credit card numbers. We retain:
          <BulletPoint>Stripe customer ID (for subscription management)</BulletPoint>
          <BulletPoint>Subscription status and billing history</BulletPoint>
          <BulletPoint>Invoice records as required by law</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">2.5 Voice Data</Text>
          {"\n"}If you use voice input:
          <BulletPoint>Audio is processed in real-time for transcription</BulletPoint>
          <BulletPoint>Raw audio is immediately discarded after transcription</BulletPoint>
          <BulletPoint>Transcribed text is treated as a standard search query</BulletPoint>
        </Section>

        <Section title="3. How We Use Your Information">
          We use collected information for:
          <BulletPoint><Text className="font-semibold">Service Delivery:</Text> To provide, maintain, and improve the Service</BulletPoint>
          <BulletPoint><Text className="font-semibold">Authentication:</Text> To verify your identity and manage your account</BulletPoint>
          <BulletPoint><Text className="font-semibold">Payment Processing:</Text> To process subscriptions and manage billing</BulletPoint>
          <BulletPoint><Text className="font-semibold">Personalization:</Text> To customize your experience based on your agency and preferences</BulletPoint>
          <BulletPoint><Text className="font-semibold">Analytics:</Text> To understand usage patterns and improve our protocols</BulletPoint>
          <BulletPoint><Text className="font-semibold">Communication:</Text> To send service updates, security alerts, and support messages</BulletPoint>
          <BulletPoint><Text className="font-semibold">Safety & Security:</Text> To detect fraud, abuse, and security threats</BulletPoint>
          <BulletPoint><Text className="font-semibold">Legal Compliance:</Text> To comply with applicable laws and regulations</BulletPoint>
        </Section>

        <Section title="4. Data Sharing and Disclosure">
          We do not sell your personal information. We may share data with:
          {"\n\n"}
          <Text className="font-semibold text-foreground">Service Providers:</Text>
          <BulletPoint>Stripe, Inc. (payment processing)</BulletPoint>
          <BulletPoint>Supabase, Inc. (database and authentication)</BulletPoint>
          <BulletPoint>Railway Corp. (cloud hosting)</BulletPoint>
          <BulletPoint>Sentry (error tracking)</BulletPoint>
          <BulletPoint>AI service providers (see Section 5)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Legal Disclosures:</Text>
          <BulletPoint>When required by law, subpoena, or court order</BulletPoint>
          <BulletPoint>To protect the rights, property, or safety of Protocol Guide, our users, or others</BulletPoint>
          <BulletPoint>In connection with a merger, acquisition, or sale of assets</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Enterprise Customers:</Text>
          {"\n"}If you use Protocol Guide through an agency or enterprise subscription, your agency administrator may have access to aggregated usage reports. Individual search queries are not shared with administrators.
        </Section>

        <Section title="5. Artificial Intelligence (AI) and Large Language Model (LLM) Usage">
          Protocol Guide uses AI technologies to enhance search functionality. This section describes how these technologies work and what data is processed.
          {"\n\n"}
          <Text className="font-semibold text-foreground">AI Services We Use:</Text>
          <BulletPoint><Text className="font-semibold">Anthropic Claude:</Text> Powers natural language understanding for protocol queries</BulletPoint>
          <BulletPoint><Text className="font-semibold">Voyage AI:</Text> Provides semantic search through text embeddings</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Data Sent to AI Services:</Text>
          <BulletPoint>Search queries and questions you submit</BulletPoint>
          <BulletPoint>Relevant protocol content to generate responses</BulletPoint>
          <BulletPoint>Conversation context within a single session</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Data NOT Sent to AI Services:</Text>
          <BulletPoint>Your name, email, or account credentials</BulletPoint>
          <BulletPoint>Payment or billing information</BulletPoint>
          <BulletPoint>Device identifiers or location data</BulletPoint>
          <BulletPoint>Protected Health Information (PHI) or patient data</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">AI Data Retention:</Text>
          <BulletPoint>Anthropic Claude API does not retain queries for model training</BulletPoint>
          <BulletPoint>Voyage AI embeddings are processed in real-time without storage</BulletPoint>
          <BulletPoint>We retain anonymized search analytics for 30 days, then aggregate data only</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Important Limitations:</Text>
          <BulletPoint>AI responses are for reference only—not clinical advice</BulletPoint>
          <BulletPoint>Do not input patient-specific or identifiable information</BulletPoint>
          <BulletPoint>Always verify information against official protocol documents</BulletPoint>
        </Section>

        <Section title="6. Data Security">
          We implement industry-standard security measures including:
          <BulletPoint>TLS 1.3 encryption for all data in transit</BulletPoint>
          <BulletPoint>AES-256 encryption for data at rest</BulletPoint>
          <BulletPoint>Row-level security policies in our database</BulletPoint>
          <BulletPoint>Regular security audits and penetration testing</BulletPoint>
          <BulletPoint>Employee access controls and security training</BulletPoint>
          <BulletPoint>Incident response procedures</BulletPoint>
          {"\n\n"}
          While we strive to protect your data, no method of electronic transmission or storage is 100% secure. You are responsible for maintaining the security of your account credentials.
        </Section>

        <Section title="7. Data Retention">
          We retain data according to the following schedule:
          {"\n\n"}
          <Text className="font-semibold text-foreground">Account Data:</Text> Retained while your account is active, plus 30 days after deletion request
          {"\n\n"}
          <Text className="font-semibold text-foreground">Usage & Analytics:</Text> 
          <BulletPoint>Individual search queries: 30 days (then anonymized)</BulletPoint>
          <BulletPoint>Aggregated analytics: 2 years</BulletPoint>
          <BulletPoint>Session data: 30 days</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Billing Records:</Text> 7 years (as required by tax law)
          {"\n\n"}
          <Text className="font-semibold text-foreground">Legal Holds:</Text> Data may be retained longer if required by law or litigation
          {"\n\n"}
          <Text className="font-semibold text-foreground">Disclaimer Acknowledgments:</Text> Retained indefinitely for legal compliance
        </Section>

        <Section title="8. Your Privacy Rights">
          <Text className="font-semibold text-foreground">All Users Have the Right To:</Text>
          <BulletPoint>Access your personal data</BulletPoint>
          <BulletPoint>Correct inaccurate data</BulletPoint>
          <BulletPoint>Delete your account and associated data</BulletPoint>
          <BulletPoint>Export your data in a portable format</BulletPoint>
          <BulletPoint>Withdraw consent for optional processing</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">To Exercise Your Rights:</Text>
          {"\n"}Email us at{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("privacy@protocol-guide.com")}
          >
            privacy@protocol-guide.com
          </Text>
          {" "}with your request. We will respond within 30 days.
        </Section>

        <Section title="9. California Privacy Rights (CCPA/CPRA)">
          If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
          {"\n\n"}
          <Text className="font-semibold text-foreground">Right to Know:</Text> You can request disclosure of:
          <BulletPoint>Categories of personal information collected</BulletPoint>
          <BulletPoint>Specific pieces of personal information collected</BulletPoint>
          <BulletPoint>Categories of sources for collection</BulletPoint>
          <BulletPoint>Business purposes for collection</BulletPoint>
          <BulletPoint>Categories of third parties with whom we share data</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Right to Delete:</Text> You can request deletion of your personal information, subject to certain exceptions.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Right to Correct:</Text> You can request correction of inaccurate personal information.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Right to Opt-Out of Sale:</Text> We do not sell personal information. If this changes, we will provide a {'"Do Not Sell My Personal Information"'} link.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Right to Non-Discrimination:</Text> We will not discriminate against you for exercising your privacy rights.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Authorized Agents:</Text> You may designate an authorized agent to make requests on your behalf with written authorization.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Verification:</Text> We will verify your identity before fulfilling requests to protect your privacy.
          {"\n\n"}
          To exercise California privacy rights, email{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("privacy@protocol-guide.com")}
          >
            privacy@protocol-guide.com
          </Text>
          {" "}with subject line {'"California Privacy Request"'}.
        </Section>

        <Section title="10. European Privacy Rights (GDPR)">
          If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR):
          {"\n\n"}
          <Text className="font-semibold text-foreground">Legal Basis for Processing:</Text>
          <BulletPoint><Text className="font-semibold">Contract:</Text> To provide the Service you requested</BulletPoint>
          <BulletPoint><Text className="font-semibold">Legitimate Interest:</Text> To improve security and prevent fraud</BulletPoint>
          <BulletPoint><Text className="font-semibold">Consent:</Text> For optional analytics and marketing communications</BulletPoint>
          <BulletPoint><Text className="font-semibold">Legal Obligation:</Text> To comply with applicable laws</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Your GDPR Rights:</Text>
          <BulletPoint>Right of access (Art. 15)</BulletPoint>
          <BulletPoint>Right to rectification (Art. 16)</BulletPoint>
          <BulletPoint>Right to erasure (Art. 17)</BulletPoint>
          <BulletPoint>Right to restrict processing (Art. 18)</BulletPoint>
          <BulletPoint>Right to data portability (Art. 20)</BulletPoint>
          <BulletPoint>Right to object (Art. 21)</BulletPoint>
          <BulletPoint>Right to withdraw consent (Art. 7)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">International Transfers:</Text>
          {"\n"}Your data is processed in the United States. We rely on Standard Contractual Clauses (SCCs) for transfers from the EEA.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Supervisory Authority:</Text>
          {"\n"}You have the right to lodge a complaint with your local data protection authority.
        </Section>

        <Section title="11. Cookies and Tracking Technologies">
          <Text className="font-semibold text-foreground">Essential Cookies:</Text> Required for authentication, security, and basic functionality. These cannot be disabled.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Analytics Cookies:</Text> Help us understand how users interact with the Service. You can opt out via our cookie preferences.
          {"\n\n"}
          <Text className="font-semibold text-foreground">Local Storage:</Text> We use device local storage to save your preferences (selected county, theme) for convenience. This data never leaves your device.
          {"\n\n"}
          You can manage cookie preferences through the app settings or by adjusting your device settings.
        </Section>

        <Section title="12. Healthcare Regulatory Compliance">
          <Text className="font-semibold text-foreground">Not a HIPAA Covered Entity:</Text>
          {"\n"}Protocol Guide is a reference tool and is not a HIPAA-covered entity. We do not create, receive, maintain, or transmit Protected Health Information (PHI).
          {"\n\n"}
          <Text className="font-semibold text-foreground">PHI and Patient Data:</Text>
          <BulletPoint>We do not collect patient health information</BulletPoint>
          <BulletPoint>The Service is not designed for patient documentation</BulletPoint>
          <BulletPoint>Users must not enter patient-identifiable information</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">If PHI is Inadvertently Submitted:</Text>
          <BulletPoint>Search queries are not retained after 30 days</BulletPoint>
          <BulletPoint>No data is used for AI model training</BulletPoint>
          <BulletPoint>Notify us immediately at{" "}
            <Text 
              style={{ color: colors.primary, textDecorationLine: "underline" }}
              onPress={() => handleEmailPress("security@protocol-guide.com")}
            >
              security@protocol-guide.com
            </Text>
          </BulletPoint>
        </Section>

        <Section title="13. Children's Privacy">
          The Service is intended for licensed EMS professionals and is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a minor, please contact us immediately.
        </Section>

        <Section title="14. Changes to This Policy">
          We may update this Privacy Policy to reflect changes in our practices or applicable law. We will:
          <BulletPoint>Post the updated policy with a new {'"Last updated"'} date</BulletPoint>
          <BulletPoint>Notify you via email or in-app notification for material changes</BulletPoint>
          <BulletPoint>Provide 30 days notice before significant changes take effect</BulletPoint>
          {"\n\n"}
          Your continued use of the Service after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="15. Contact Us">
          For privacy-related questions or to exercise your rights:
          {"\n\n"}
          <Text className="font-semibold">Apex AI LLC</Text>
          {"\n"}Privacy Team
          {"\n\n"}
          Email:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("privacy@protocol-guide.com")}
          >
            privacy@protocol-guide.com
          </Text>
          {"\n\n"}
          For security incidents:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("security@protocol-guide.com")}
          >
            security@protocol-guide.com
          </Text>
          {"\n\n"}
          We aim to respond to all privacy inquiries within 30 days.
        </Section>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-foreground mb-2">{title}</Text>
      <Text className="text-base text-foreground leading-6">{children}</Text>
    </View>
  );
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-base text-foreground leading-6">{"\n"}• {children}</Text>
  );
}

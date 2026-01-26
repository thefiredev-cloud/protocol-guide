import React from "react";
import { ScrollView, Text, View, Pressable, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

export default function TermsOfServiceScreen() {
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
        <Text className="text-lg font-bold text-foreground ml-2">Terms of Service</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground mb-2">Terms of Service</Text>
        <Text className="text-sm text-muted mb-6">Last updated: January 27, 2025</Text>

        <Section title="1. Acceptance of Terms">
          These Terms of Service ({'"Terms"'}) constitute a legally binding agreement between you and Apex AI LLC ({'"Company," "we," "our," or "us"'}), governing your access to and use of the Protocol Guide application and related services (collectively, the {'"Service"'}).
          {"\n\n"}
          By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Service.
          {"\n\n"}
          If you are using the Service on behalf of an organization (such as a fire department, EMS agency, or hospital), you represent and warrant that you have authority to bind that organization to these Terms.
        </Section>

        <Section title="2. Description of Service">
          Protocol Guide is a clinical decision support tool that provides Emergency Medical Services (EMS) professionals with access to emergency medical protocols, guidelines, and reference materials. The Service includes:
          <BulletPoint>Protocol retrieval and search functionality</BulletPoint>
          <BulletPoint>AI-powered natural language search</BulletPoint>
          <BulletPoint>Medication dose calculators</BulletPoint>
          <BulletPoint>Bookmarking and history features</BulletPoint>
          <BulletPoint>Multi-agency protocol support</BulletPoint>
          {"\n\n"}
          <Text className="font-bold" style={{ color: colors.error }}>
            THE SERVICE IS A REFERENCE TOOL ONLY AND IS NOT INTENDED TO REPLACE PROFESSIONAL MEDICAL JUDGMENT, TRAINING, DIRECT MEDICAL CONTROL, OR YOUR LOCAL PROTOCOLS.
          </Text>
        </Section>

        <Section title="3. Eligibility and User Accounts">
          <Text className="font-semibold text-foreground">3.1 Eligibility</Text>
          {"\n"}To use the Service, you must:
          <BulletPoint>Be at least 18 years of age</BulletPoint>
          <BulletPoint>Be a licensed or certified EMS professional, or working under the supervision of one</BulletPoint>
          <BulletPoint>Provide accurate and complete registration information</BulletPoint>
          <BulletPoint>Maintain the security of your account credentials</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">3.2 Account Responsibilities</Text>
          {"\n"}You are responsible for:
          <BulletPoint>All activities that occur under your account</BulletPoint>
          <BulletPoint>Maintaining the confidentiality of your login credentials</BulletPoint>
          <BulletPoint>Notifying us immediately of any unauthorized access</BulletPoint>
          <BulletPoint>Ensuring compliance with your organization{"'"}s policies</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">3.3 Account Sharing</Text>
          {"\n"}Account credentials are for individual use only. Enterprise customers may provision multiple accounts for their personnel through our enterprise subscription.
        </Section>

        <Section title="4. Subscription and Payment">
          <Text className="font-semibold text-foreground">4.1 Subscription Tiers</Text>
          <BulletPoint><Text className="font-semibold">Free Tier:</Text> Limited to 5 protocol queries per day, 1 county/region</BulletPoint>
          <BulletPoint><Text className="font-semibold">Pro Subscription:</Text> Unlimited queries, all features, multiple regions ($9.99/month or $89/year)</BulletPoint>
          <BulletPoint><Text className="font-semibold">Enterprise:</Text> Custom pricing for agencies and departments (contact sales)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">4.2 Billing</Text>
          <BulletPoint>Payments are processed securely through Stripe, Inc.</BulletPoint>
          <BulletPoint>Subscriptions automatically renew unless cancelled before the renewal date</BulletPoint>
          <BulletPoint>You may cancel at any time through account settings</BulletPoint>
          <BulletPoint>Cancelled subscriptions remain active until the end of the billing period</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">4.3 Refunds</Text>
          <BulletPoint>Pro subscriptions: 14-day refund policy for first-time subscribers</BulletPoint>
          <BulletPoint>Enterprise contracts: Per agreement terms</BulletPoint>
          <BulletPoint>After the refund period, payments are non-refundable except as required by law</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">4.4 Price Changes</Text>
          {"\n"}We reserve the right to modify pricing with 30 days advance notice to existing subscribers. Price changes do not affect current subscription periods.
        </Section>

        <Section title="5. Enterprise and Agency Terms">
          <Text className="font-semibold text-foreground">5.1 Enterprise Subscriptions</Text>
          {"\n"}Fire departments, EMS agencies, hospitals, and other organizations may enter into enterprise subscription agreements. Enterprise terms may include:
          <BulletPoint>Volume licensing and seat management</BulletPoint>
          <BulletPoint>Custom protocol integration</BulletPoint>
          <BulletPoint>Administrative dashboards and usage reporting</BulletPoint>
          <BulletPoint>Single sign-on (SSO) integration</BulletPoint>
          <BulletPoint>Service level agreements (SLAs)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">5.2 Agency Administrator Responsibilities</Text>
          {"\n"}Enterprise administrators are responsible for:
          <BulletPoint>Managing user access and permissions</BulletPoint>
          <BulletPoint>Ensuring users acknowledge the medical disclaimer</BulletPoint>
          <BulletPoint>Compliance with organizational policies</BulletPoint>
          <BulletPoint>Timely payment of subscription fees</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">5.3 Custom Protocol Content</Text>
          {"\n"}If your agency provides custom protocol content, you represent and warrant that:
          <BulletPoint>You have the right to provide such content</BulletPoint>
          <BulletPoint>The content is accurate and current</BulletPoint>
          <BulletPoint>Updates are provided promptly when protocols change</BulletPoint>
        </Section>

        <Section title="6. Acceptable Use Policy">
          <Text className="font-semibold text-foreground">6.1 Permitted Use</Text>
          {"\n"}The Service is provided for lawful clinical reference purposes by authorized EMS professionals.
          {"\n\n"}
          <Text className="font-semibold text-foreground">6.2 Prohibited Conduct</Text>
          {"\n"}You agree NOT to:
          <BulletPoint>Use the Service for any unlawful purpose</BulletPoint>
          <BulletPoint>Enter Protected Health Information (PHI) or patient-identifiable data</BulletPoint>
          <BulletPoint>Share account credentials with unauthorized users</BulletPoint>
          <BulletPoint>Attempt to reverse engineer, decompile, or extract source code</BulletPoint>
          <BulletPoint>Interfere with or disrupt the Service or servers</BulletPoint>
          <BulletPoint>Use automated systems (bots, scrapers) without permission</BulletPoint>
          <BulletPoint>Resell, redistribute, or sublicense the Service</BulletPoint>
          <BulletPoint>Attempt to circumvent usage limits or security measures</BulletPoint>
          <BulletPoint>Use the Service in a manner that could harm patients or others</BulletPoint>
          <BulletPoint>Misrepresent the source or accuracy of information from the Service</BulletPoint>
        </Section>

        <Section title="7. Medical Disclaimer and Clinical Use">
          <View 
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.error + "15", borderColor: colors.error, borderWidth: 2 }}
          >
            <Text className="text-base font-bold mb-2" style={{ color: colors.error }}>
              CRITICAL MEDICAL DISCLAIMER
            </Text>
            <Text className="text-sm" style={{ color: colors.error, lineHeight: 20 }}>
              THE SERVICE IS A REFERENCE TOOL ONLY AND IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL JUDGMENT, TRAINING, OR DIRECT MEDICAL CONTROL. ALWAYS FOLLOW YOUR LOCAL PROTOCOLS AND MEDICAL DIRECTOR GUIDANCE.
            </Text>
          </View>
          
          <Text className="font-semibold text-foreground">7.1 Not Medical Advice</Text>
          {"\n"}Information provided through the Service:
          <BulletPoint>Is for reference purposes only</BulletPoint>
          <BulletPoint>Does not constitute medical advice, diagnosis, or treatment</BulletPoint>
          <BulletPoint>Should not be used as the sole basis for patient care decisions</BulletPoint>
          <BulletPoint>May not reflect current guidelines or your local protocols</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">7.2 Professional Responsibility</Text>
          {"\n"}As an EMS professional, YOU are responsible for:
          <BulletPoint>Following your agency{"'"}s approved protocols</BulletPoint>
          <BulletPoint>Obtaining medical direction when required</BulletPoint>
          <BulletPoint>Exercising independent clinical judgment</BulletPoint>
          <BulletPoint>Practicing within your scope of practice</BulletPoint>
          <BulletPoint>Verifying all medication dosages and treatments</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">7.3 Local Protocol Precedence</Text>
          {"\n"}YOUR LOCAL PROTOCOLS ALWAYS TAKE PRECEDENCE over any information in the Service. In case of conflict, follow your:
          <BulletPoint>Agency{"'"}s written protocols and policies</BulletPoint>
          <BulletPoint>Medical director orders</BulletPoint>
          <BulletPoint>State and regional EMS regulations</BulletPoint>
          <BulletPoint>Online medical control directions</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">7.4 AI-Generated Content</Text>
          {"\n"}Search results may include AI-generated summaries. These:
          <BulletPoint>May contain errors or inaccuracies</BulletPoint>
          <BulletPoint>Should always be verified against source documents</BulletPoint>
          <BulletPoint>Are not a substitute for reviewing actual protocols</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">7.5 Acknowledgment Requirement</Text>
          {"\n"}You must acknowledge the medical disclaimer before accessing protocol search features. Your acknowledgment is recorded for legal compliance.
        </Section>

        <Section title="8. Intellectual Property">
          <Text className="font-semibold text-foreground">8.1 Our Intellectual Property</Text>
          {"\n"}The Service, including its software, design, features, and functionality, is owned by Apex AI LLC and protected by copyright, trademark, and other intellectual property laws.
          {"\n\n"}
          <Text className="font-semibold text-foreground">8.2 Protocol Content</Text>
          {"\n"}Medical protocol content may be subject to third-party intellectual property rights. Such content is provided under license and may not be redistributed without permission.
          {"\n\n"}
          <Text className="font-semibold text-foreground">8.3 Limited License</Text>
          {"\n"}We grant you a limited, non-exclusive, non-transferable license to use the Service for its intended purpose, subject to these Terms.
          {"\n\n"}
          <Text className="font-semibold text-foreground">8.4 Feedback</Text>
          {"\n"}Any feedback, suggestions, or ideas you submit may be used by us without compensation or attribution to you.
        </Section>

        <Section title="9. Disclaimer of Warranties">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          {"\n\n"}
          THE SERVICE IS PROVIDED {'"AS IS"'} AND {'"AS AVAILABLE"'} WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          <BulletPoint>Warranties of merchantability or fitness for a particular purpose</BulletPoint>
          <BulletPoint>Warranties of accuracy, completeness, or timeliness of content</BulletPoint>
          <BulletPoint>Warranties of non-infringement</BulletPoint>
          <BulletPoint>Warranties that the Service will be uninterrupted or error-free</BulletPoint>
          {"\n\n"}
          WE DO NOT WARRANT THAT:
          <BulletPoint>Protocol information is current or applicable to your jurisdiction</BulletPoint>
          <BulletPoint>Medication dosages or treatment recommendations are accurate</BulletPoint>
          <BulletPoint>The Service will meet your specific requirements</BulletPoint>
          <BulletPoint>AI-generated content is free from errors</BulletPoint>
        </Section>

        <Section title="10. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
          {"\n\n"}
          <Text className="font-semibold text-foreground">10.1 Exclusion of Damages</Text>
          {"\n"}APEX AI LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY:
          <BulletPoint>Indirect, incidental, special, consequential, or punitive damages</BulletPoint>
          <BulletPoint>Loss of profits, revenue, data, or goodwill</BulletPoint>
          <BulletPoint>Personal injury or death resulting from use of the Service</BulletPoint>
          <BulletPoint>Medical malpractice or clinical errors</BulletPoint>
          <BulletPoint>Patient care outcomes or treatment decisions</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">10.2 Cap on Liability</Text>
          {"\n"}OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE GREATER OF:
          <BulletPoint>The amount you paid us in the 12 months preceding the claim, or</BulletPoint>
          <BulletPoint>One hundred dollars ($100)</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">10.3 Basis of the Bargain</Text>
          {"\n"}THE LIMITATIONS IN THIS SECTION REFLECT THE ALLOCATION OF RISK BETWEEN THE PARTIES AND ARE AN ESSENTIAL BASIS OF THE BARGAIN BETWEEN US.
        </Section>

        <Section title="11. Indemnification">
          You agree to indemnify, defend, and hold harmless Apex AI LLC and its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys{"'"} fees) arising from:
          <BulletPoint>Your use of the Service</BulletPoint>
          <BulletPoint>Your violation of these Terms</BulletPoint>
          <BulletPoint>Your violation of any law or regulation</BulletPoint>
          <BulletPoint>Your violation of any third-party rights</BulletPoint>
          <BulletPoint>Patient care decisions you make using the Service</BulletPoint>
          <BulletPoint>Content you submit through the Service</BulletPoint>
        </Section>

        <Section title="12. Termination">
          <Text className="font-semibold text-foreground">12.1 Termination by You</Text>
          {"\n"}You may terminate your account at any time through account settings or by contacting support.
          {"\n\n"}
          <Text className="font-semibold text-foreground">12.2 Termination by Us</Text>
          {"\n"}We may suspend or terminate your account immediately, without prior notice, if:
          <BulletPoint>You breach these Terms</BulletPoint>
          <BulletPoint>We are required to do so by law</BulletPoint>
          <BulletPoint>We discontinue the Service</BulletPoint>
          <BulletPoint>Your payment fails and is not remedied</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">12.3 Effect of Termination</Text>
          {"\n"}Upon termination:
          <BulletPoint>Your right to use the Service immediately ceases</BulletPoint>
          <BulletPoint>We may delete your account data (subject to our retention policy)</BulletPoint>
          <BulletPoint>Sections 7-15 survive termination</BulletPoint>
        </Section>

        <Section title="13. Dispute Resolution">
          <Text className="font-semibold text-foreground">13.1 Governing Law</Text>
          {"\n"}These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.
          {"\n\n"}
          <Text className="font-semibold text-foreground">13.2 Arbitration Agreement</Text>
          {"\n"}Any dispute arising from these Terms or your use of the Service shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
          {"\n\n"}
          <Text className="font-semibold text-foreground">13.3 Class Action Waiver</Text>
          {"\n"}YOU AND APEX AI LLC AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION.
          {"\n\n"}
          <Text className="font-semibold text-foreground">13.4 Exception</Text>
          {"\n"}Either party may bring claims in small claims court if the claims qualify.
        </Section>

        <Section title="14. Changes to Terms">
          We reserve the right to modify these Terms at any time. We will:
          <BulletPoint>Post updated Terms with a new {'"Last updated"'} date</BulletPoint>
          <BulletPoint>Notify you of material changes via email or in-app notice</BulletPoint>
          <BulletPoint>Provide 30 days notice before significant changes take effect</BulletPoint>
          {"\n\n"}
          Your continued use of the Service after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service.
        </Section>

        <Section title="15. General Provisions">
          <Text className="font-semibold text-foreground">15.1 Entire Agreement</Text>
          {"\n"}These Terms, together with the Privacy Policy and Medical Disclaimer, constitute the entire agreement between you and Apex AI LLC regarding the Service.
          {"\n\n"}
          <Text className="font-semibold text-foreground">15.2 Severability</Text>
          {"\n"}If any provision of these Terms is found invalid or unenforceable, the remaining provisions will continue in effect.
          {"\n\n"}
          <Text className="font-semibold text-foreground">15.3 Waiver</Text>
          {"\n"}Our failure to enforce any provision of these Terms is not a waiver of that provision or our right to enforce it later.
          {"\n\n"}
          <Text className="font-semibold text-foreground">15.4 Assignment</Text>
          {"\n"}You may not assign your rights under these Terms without our written consent. We may assign our rights without restriction.
          {"\n\n"}
          <Text className="font-semibold text-foreground">15.5 Force Majeure</Text>
          {"\n"}We are not liable for any failure to perform due to causes beyond our reasonable control, including natural disasters, war, terrorism, or government actions.
        </Section>

        <Section title="16. Contact Us">
          For questions about these Terms:
          {"\n\n"}
          <Text className="font-semibold">Apex AI LLC</Text>
          {"\n"}Legal Department
          {"\n\n"}
          Email:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("legal@protocol-guide.com")}
          >
            legal@protocol-guide.com
          </Text>
          {"\n\n"}
          For enterprise inquiries:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("sales@protocol-guide.com")}
          >
            sales@protocol-guide.com
          </Text>
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

import React from "react";
import { ScrollView, Text, View, Pressable, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";

export default function MedicalDisclaimerScreen() {
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
        <Text className="text-lg font-bold text-foreground ml-2">Medical Disclaimer</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground mb-2">Medical Disclaimer</Text>
        <Text className="text-sm text-muted mb-6">Last updated: January 27, 2025</Text>

        {/* Critical Warning Box */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.error + "15", borderColor: colors.error, borderWidth: 2 }}
        >
          <View className="flex-row items-center mb-3">
            <IconSymbol name="exclamationmark.triangle.fill" size={28} color={colors.error} />
            <Text className="text-xl font-bold ml-2" style={{ color: colors.error }}>
              CRITICAL WARNING
            </Text>
          </View>
          <Text className="text-base font-semibold mb-2" style={{ color: colors.error, lineHeight: 24 }}>
            Protocol Guide is a REFERENCE TOOL ONLY.
          </Text>
          <Text className="text-base" style={{ color: colors.error, lineHeight: 24 }}>
            It is NOT a substitute for:
          </Text>
          <View className="mt-2 ml-2">
            <Text className="text-base" style={{ color: colors.error, lineHeight: 24 }}>• Professional medical judgment</Text>
            <Text className="text-base" style={{ color: colors.error, lineHeight: 24 }}>• Proper EMS training and certification</Text>
            <Text className="text-base" style={{ color: colors.error, lineHeight: 24 }}>• Direct medical control</Text>
            <Text className="text-base" style={{ color: colors.error, lineHeight: 24 }}>• YOUR LOCAL PROTOCOLS</Text>
          </View>
        </View>

        {/* Secondary Warning */}
        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: colors.warning + "15", borderColor: colors.warning, borderWidth: 1 }}
        >
          <View className="flex-row items-start">
            <IconSymbol name="info.circle.fill" size={20} color={colors.warning} />
            <Text className="text-sm ml-2 flex-1" style={{ color: colors.foreground, lineHeight: 20 }}>
              <Text className="font-bold">YOUR LOCAL PROTOCOLS ALWAYS TAKE PRECEDENCE</Text> over any information provided in this application. In case of any conflict, follow your agency&apos;s written protocols and medical director guidance.
            </Text>
          </View>
        </View>

        <Section title="1. Purpose and Intended Use">
          Protocol Guide is designed to serve as a clinical decision support reference tool for trained Emergency Medical Services (EMS) professionals, including:
          <BulletPoint>Emergency Medical Technicians (EMTs)</BulletPoint>
          <BulletPoint>Advanced EMTs (AEMTs)</BulletPoint>
          <BulletPoint>Paramedics</BulletPoint>
          <BulletPoint>Flight medics and critical care paramedics</BulletPoint>
          <BulletPoint>EMS supervisors and training officers</BulletPoint>
          <BulletPoint>Medical directors and physician advisors</BulletPoint>
          {"\n\n"}
          The Service is intended to supplement—never replace—the knowledge, skills, clinical judgment, and training of qualified healthcare providers.
        </Section>

        <Section title="2. Not Medical Advice">
          The protocols, guidelines, medication information, and other content provided through Protocol Guide:
          <BulletPoint><Text className="font-bold">ARE NOT</Text> medical advice, diagnosis, or treatment recommendations</BulletPoint>
          <BulletPoint><Text className="font-bold">ARE NOT</Text> intended for direct patient care without professional judgment</BulletPoint>
          <BulletPoint><Text className="font-bold">ARE NOT</Text> a substitute for proper medical education and training</BulletPoint>
          <BulletPoint><Text className="font-bold">MAY NOT</Text> reflect the most current medical research or guidelines</BulletPoint>
          <BulletPoint><Text className="font-bold">MAY NOT</Text> match your specific jurisdiction&apos;s protocols</BulletPoint>
          <BulletPoint><Text className="font-bold">MAY CONTAIN</Text> errors, omissions, or outdated information</BulletPoint>
        </Section>

        <Section title="3. Professional Responsibility">
          As an EMS professional using this Service, YOU are solely responsible for:
          {"\n\n"}
          <Text className="font-semibold text-foreground">Clinical Decision-Making:</Text>
          <BulletPoint>Exercising independent professional judgment in all patient care situations</BulletPoint>
          <BulletPoint>Assessing each patient individually based on their presentation</BulletPoint>
          <BulletPoint>Adapting treatment to the specific circumstances of each call</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Protocol Compliance:</Text>
          <BulletPoint>Following your agency&apos;s approved protocols and standing orders</BulletPoint>
          <BulletPoint>Obtaining appropriate medical direction when required</BulletPoint>
          <BulletPoint>Practicing within your scope of practice and certification level</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Verification and Validation:</Text>
          <BulletPoint>Verifying all medication names, dosages, routes, and contraindications</BulletPoint>
          <BulletPoint>Confirming treatment parameters against your local protocols</BulletPoint>
          <BulletPoint>Double-checking calculations, especially for pediatric patients</BulletPoint>
          {"\n\n"}
          <Text className="font-semibold text-foreground">Professional Standards:</Text>
          <BulletPoint>Maintaining current certifications and continuing education</BulletPoint>
          <BulletPoint>Documenting all patient care according to your agency&apos;s requirements</BulletPoint>
          <BulletPoint>Reporting any suspected errors or inaccuracies in the Service</BulletPoint>
        </Section>

        <Section title="4. Local Protocol Precedence">
          <Text className="font-bold" style={{ color: colors.error }}>
            YOUR LOCAL PROTOCOLS ALWAYS TAKE PRECEDENCE.
          </Text>
          {"\n\n"}
          Protocol Guide provides general reference information from various sources. This information may differ significantly from your jurisdiction&apos;s approved protocols. You must always follow:
          {"\n\n"}
          <Text className="font-semibold text-foreground">In order of priority:</Text>
          <BulletPoint><Text className="font-bold">1.</Text> Direct online medical control instructions</BulletPoint>
          <BulletPoint><Text className="font-bold">2.</Text> Your agency&apos;s written protocols and policies</BulletPoint>
          <BulletPoint><Text className="font-bold">3.</Text> Medical director standing orders</BulletPoint>
          <BulletPoint><Text className="font-bold">4.</Text> State and regional EMS regulations</BulletPoint>
          <BulletPoint><Text className="font-bold">5.</Text> National EMS guidelines and standards</BulletPoint>
          {"\n\n"}
          If Protocol Guide provides information that conflicts with any of the above, you must follow your local guidance.
        </Section>

        <Section title="5. Artificial Intelligence (AI) Limitations">
          Protocol Guide uses AI-powered search to help you find relevant protocols. AI-generated content:
          <BulletPoint><Text className="font-bold">May contain errors</Text> or misinterpret your query</BulletPoint>
          <BulletPoint><Text className="font-bold">May be incomplete</Text> or miss relevant protocols</BulletPoint>
          <BulletPoint><Text className="font-bold">May hallucinate</Text> information that sounds correct but is not</BulletPoint>
          <BulletPoint><Text className="font-bold">Cannot assess</Text> your specific patient&apos;s condition</BulletPoint>
          <BulletPoint><Text className="font-bold">Cannot replace</Text> clinical judgment or direct patient assessment</BulletPoint>
          {"\n\n"}
          <Text className="font-bold" style={{ color: colors.warning }}>
            ALWAYS verify AI-generated responses against official protocol documents before making clinical decisions.
          </Text>
        </Section>

        <Section title="6. Medication and Dosing Information">
          Medication information in Protocol Guide, including drug names, dosages, routes, and contraindications:
          <BulletPoint>Is provided for reference purposes only</BulletPoint>
          <BulletPoint>May not reflect current FDA labeling or guidelines</BulletPoint>
          <BulletPoint>May differ from your local formulary</BulletPoint>
          <BulletPoint>May contain errors in calculations or units</BulletPoint>
          {"\n\n"}
          <Text className="font-bold" style={{ color: colors.error }}>
            CRITICAL: Always verify medication dosages against:
          </Text>
          <BulletPoint>Your local protocols</BulletPoint>
          <BulletPoint>Current drug references</BulletPoint>
          <BulletPoint>Medical direction when in doubt</BulletPoint>
          {"\n\n"}
          Use particular caution with:
          <BulletPoint>Pediatric dosing (weight-based calculations)</BulletPoint>
          <BulletPoint>High-alert medications</BulletPoint>
          <BulletPoint>Controlled substances</BulletPoint>
          <BulletPoint>Push-dose pressors and other critical medications</BulletPoint>
        </Section>

        <Section title="7. Emergency Situations">
          During active patient care emergencies:
          <BulletPoint><Text className="font-bold">DO NOT</Text> delay patient care to consult this application</BulletPoint>
          <BulletPoint><Text className="font-bold">DO</Text> rely on your training and established protocols</BulletPoint>
          <BulletPoint><Text className="font-bold">DO</Text> contact medical control for guidance when appropriate</BulletPoint>
          <BulletPoint><Text className="font-bold">DO</Text> document all care per your agency&apos;s requirements</BulletPoint>
          {"\n\n"}
          The Service is intended for pre-planning, education, and quick reference—not as a primary resource during time-critical emergencies.
        </Section>

        <Section title="8. Accuracy and Updates">
          While we strive to provide accurate and current information:
          <BulletPoint>Medical guidelines and protocols change frequently</BulletPoint>
          <BulletPoint>There may be delays in updating content</BulletPoint>
          <BulletPoint>Third-party protocol content may become outdated</BulletPoint>
          <BulletPoint>Errors or omissions may exist despite our efforts</BulletPoint>
          <BulletPoint>We cannot guarantee accuracy for all jurisdictions</BulletPoint>
          {"\n\n"}
          We update content regularly but cannot guarantee real-time accuracy. Protocol changes in your jurisdiction may not be immediately reflected.
        </Section>

        <Section title="9. No Warranty">
          Protocol Guide is provided <Text className="font-bold">{'"AS IS"'}</Text> and <Text className="font-bold">{'"AS AVAILABLE"'}</Text> without any warranties, express or implied, including but not limited to:
          <BulletPoint>Warranties of merchantability</BulletPoint>
          <BulletPoint>Fitness for a particular purpose</BulletPoint>
          <BulletPoint>Non-infringement</BulletPoint>
          <BulletPoint>Accuracy, completeness, or timeliness</BulletPoint>
          {"\n\n"}
          We do not warrant that:
          <BulletPoint>The Service will meet your specific requirements</BulletPoint>
          <BulletPoint>Results obtained will be accurate or reliable</BulletPoint>
          <BulletPoint>The Service will be uninterrupted or error-free</BulletPoint>
          <BulletPoint>Content is applicable to your jurisdiction</BulletPoint>
        </Section>

        <Section title="10. Limitation of Liability">
          <Text className="font-bold">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</Text>
          {"\n\n"}
          APEX AI LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND AFFILIATES SHALL NOT BE LIABLE FOR:
          <BulletPoint>Any direct, indirect, incidental, special, consequential, or punitive damages</BulletPoint>
          <BulletPoint>Any loss of profits, revenue, data, or goodwill</BulletPoint>
          <BulletPoint>Any personal injury or death</BulletPoint>
          <BulletPoint>Any medical malpractice claims</BulletPoint>
          <BulletPoint>Any patient care outcomes</BulletPoint>
          <BulletPoint>Any clinical decisions made using the Service</BulletPoint>
          <BulletPoint>Any errors or omissions in content</BulletPoint>
          {"\n\n"}
          ARISING FROM OR RELATED TO:
          <BulletPoint>Your use or inability to use the Service</BulletPoint>
          <BulletPoint>Any reliance on information provided</BulletPoint>
          <BulletPoint>Any patient care rendered using the Service as a reference</BulletPoint>
          <BulletPoint>Any medication dosing errors</BulletPoint>
          {"\n\n"}
          <Text className="font-bold">
            YOU ASSUME ALL RISK AND RESPONSIBILITY FOR YOUR CLINICAL DECISIONS AND PATIENT CARE OUTCOMES.
          </Text>
        </Section>

        <Section title="11. Indemnification">
          By using Protocol Guide, you agree to indemnify, defend, and hold harmless Apex AI LLC and its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from:
          <BulletPoint>Your use of the Service</BulletPoint>
          <BulletPoint>Any patient care decisions you make</BulletPoint>
          <BulletPoint>Any clinical errors or omissions</BulletPoint>
          <BulletPoint>Your violation of these terms</BulletPoint>
          <BulletPoint>Your violation of any applicable laws or regulations</BulletPoint>
        </Section>

        <Section title="12. Acknowledgment and Acceptance">
          By using Protocol Guide, you acknowledge that:
          <BulletPoint>You have read, understood, and agree to this Medical Disclaimer</BulletPoint>
          <BulletPoint>You are a trained EMS professional or working under appropriate supervision</BulletPoint>
          <BulletPoint>You understand the Service is for reference only, not patient care direction</BulletPoint>
          <BulletPoint>You will always verify information against your local protocols</BulletPoint>
          <BulletPoint>You accept full responsibility for your clinical decisions</BulletPoint>
          <BulletPoint>Your acknowledgment is recorded with a timestamp for legal purposes</BulletPoint>
          {"\n\n"}
          <Text className="font-bold">
            IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.
          </Text>
        </Section>

        <Section title="13. Report Concerns">
          If you identify any errors, outdated information, or have concerns about content accuracy, please report them immediately:
          {"\n\n"}
          <Text className="font-semibold">For content errors:</Text>
          {"\n"}Email:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("medical@protocol-guide.com")}
          >
            medical@protocol-guide.com
          </Text>
          {"\n\n"}
          <Text className="font-semibold">For technical issues:</Text>
          {"\n"}Email:{" "}
          <Text 
            style={{ color: colors.primary, textDecorationLine: "underline" }}
            onPress={() => handleEmailPress("support@protocol-guide.com")}
          >
            support@protocol-guide.com
          </Text>
          {"\n\n"}
          Include:
          <BulletPoint>Protocol number and title (if applicable)</BulletPoint>
          <BulletPoint>Description of the error or concern</BulletPoint>
          <BulletPoint>Your jurisdiction (state/county)</BulletPoint>
          <BulletPoint>Source documentation if available</BulletPoint>
        </Section>

        {/* Final Warning Box */}
        <View 
          className="p-4 rounded-xl mt-2 mb-6"
          style={{ backgroundColor: colors.error + "10", borderColor: colors.error, borderWidth: 1 }}
        >
          <Text className="text-sm font-bold text-center" style={{ color: colors.error }}>
            REMEMBER: Protocol Guide is a reference tool.{"\n"}
            YOUR training, YOUR protocols, and YOUR clinical judgment{"\n"}
            are what save lives.
          </Text>
        </View>

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

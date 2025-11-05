"use client";

import { WelcomeCardExamples } from "./welcome-card-examples";
import { WelcomeCardHeader } from "./welcome-card-header";
import { WelcomeCardProtocols } from "./welcome-card-protocols";

type WelcomeCardProps = {
  onExampleSelect?: (value: string) => void;
};

export function WelcomeCard({ onExampleSelect }: WelcomeCardProps) {
  const prompts = [
    { label: "Trauma – fall from ladder", value: "Adult fall from ladder, unstable vitals" },
    { label: "Chest pain eval", value: "Middle-aged patient chest pain, nitro given" },
    { label: "Pediatric seizure", value: "5 year old seizure, postictal" },
  ];

  const protocols = ["1231 Airway Obstruction", "1212 Bradycardia", "1203 Stroke", "1305 Trauma Base"];

  return (
    <section
      aria-label="Welcome to Medic Bot"
      className="glass-elevated scroll-animate-scale"
      style={{
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      <WelcomeCardHeader
        title="Ready when you are"
        description="Share the chief complaint, key vitals, and interventions. I’ll align everything with the LA County Prehospital Care Manual."
      />
      <WelcomeCardExamples prompts={prompts} onSelect={onExampleSelect} />
      <WelcomeCardProtocols items={protocols} />
    </section>
  );
}



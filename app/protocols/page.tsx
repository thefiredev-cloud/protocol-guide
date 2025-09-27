"use client";

import { DecisionTree, type TreeNode } from "@/app/components/decision-tree";

const traumaNodes: TreeNode[] = [
  { id: "start", type: "question", text: "Does the patient meet physiologic criteria (Section I)?", options: [
    { label: "Yes", to: "section1" },
    { label: "No", to: "checkAnatomic" },
  ] },
  { id: "section1", type: "result", text: "Trauma Center Destination (Section I)", actions: ["Transport to nearest designated trauma center", "Base Contact: YES"] },
  { id: "checkAnatomic", type: "question", text: "Anatomic criteria (Section II)?", options: [
    { label: "Yes", to: "section2" },
    { label: "No", to: "checkMechanism" },
  ] },
  { id: "section2", type: "result", text: "Trauma Center Destination (Section II)", actions: ["Transport to nearest designated trauma center", "Base Contact: YES"] },
  { id: "checkMechanism", type: "question", text: "Mechanism or special considerations (Section III)?", options: [
    { label: "Yes", to: "section3" },
    { label: "No", to: "baseContact" },
  ] },
  { id: "section3", type: "result", text: "Trauma Center Consideration (Section III)", actions: ["Consider trauma center based on clinical judgment", "Base Contact: Consider"] },
  { id: "baseContact", type: "result", text: "Non-trauma center acceptable.", actions: ["Base Contact: As needed"] },
];

const arrestNodes: TreeNode[] = [
  { id: "start", type: "question", text: "Pulseless and apneic?", options: [
    { label: "Yes", to: "cpr" },
    { label: "No", to: "rost" },
  ] },
  { id: "cpr", type: "result", text: "Start high-quality CPR and attach monitor/defib.", actions: ["Defibrillate VF/VT", "Epinephrine 1 mg IV/IO q5min", "Consider airway"] },
  { id: "rost", type: "result", text: "Follow appropriate non-arrest protocol.", actions: ["Assess ABCs", "Treat per impression"] },
];

export default function ProtocolsPage() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <h1>Protocol Decision Trees</h1>
      <DecisionTree title="Trauma Triage" nodes={traumaNodes} startId="start" />
      <DecisionTree title="Cardiac Arrest (Adult)" nodes={arrestNodes} startId="start" />
    </div>
  );
}



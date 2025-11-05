"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { memo, useState } from "react";

import { ProtocolFormatter } from "./protocol-formatter";

type ProtocolDef = {
  name: string;
  description: string;
  medications: string[];
  criticalInfo: string[];
};

const SOB_PROTOCOLS: Record<string, ProtocolDef> = {
  "Airway Obstruction 1231": {
    name: "Airway Obstruction (1231)",
    description: "Complete/partial airway obstruction, foreign body, choking, stridor",
    medications: [
      "Oxygen 15L/min via non-rebreather - If O2 sat <94%",
      "Epinephrine 0.5mg IM - For severe allergic reaction"
    ],
    criticalInfo: [
      "For conscious patient: Heimlich maneuver (adults) or back blows and chest thrusts (infants)",
      "For unconscious patient: Begin CPR, check mouth for visible foreign body",
      "Do not perform blind finger sweeps",
      "Base Contact: YES - Severe respiratory distress or arrest"
    ]
  },
  "Respiratory Distress Bronchospasm 1233": {
    name: "Respiratory Distress - Bronchospasm (1233)",
    description: "COPD/asthma exacerbation, wheezing, bronchospasm",
    medications: [
      "Albuterol 5mg via nebulizer - May repeat q20min",
      "Epinephrine 0.5mg IM - For severe bronchospasm",
      "Oxygen 15L/min via non-rebreather - If O2 sat <94%"
    ],
    criticalInfo: [
      "Position patient upright if respiratory status allows",
      "Consider CPAP if severe respiratory distress",
      "Base Hospital Contact: Required for severe respiratory distress unresponsive or not amenable to CPAP"
    ]
  },
  "Respiratory Distress Other 1237": {
    name: "Respiratory Distress - Other (1237)",
    description: "Bronchospasm, COPD or asthma exacerbation",
    medications: [
      "Oxygen 15L/min via non-rebreather - If O2 sat <94%",
      "Albuterol 5mg (6mL) via nebulizer or 4 puffs via MDI",
      "  - May repeat x2 prn wheezing",
      "  - May be administered in-line with CPAP for moderate or severe respiratory distress",
      "Epinephrine 0.5mg (0.5mL) IM - For deteriorating respiratory status despite albuterol",
      "  - Consider early in asthma exacerbation with poor perfusion",
      "  - Unlikely to benefit patients with COPD exacerbation"
    ],
    criticalInfo: [
      "Position patient upright if respiratory status allows",
      "Document Provider Impression as Respiratory Distress / Bronchospasm",
      "Consider CPAP if severe respiratory distress",
      "Base Hospital Contact: Required for severe respiratory distress unresponsive or not amenable to CPAP"
    ]
  },
  "Respiratory Distress Pulmonary Edema 1214": {
    name: "Respiratory Distress - Pulmonary Edema/CHF (1214)",
    description: "Congestive heart failure, pulmonary edema",
    medications: [
      "Nitroglycerin - For SBP >100 with no sexually enhancing drugs within 48 hours:",
      "  - 0.4mg SL for SBP ≥ 100mmHg",
      "  - 0.8mg SL for SBP ≥ 150mmHg",
      "  - 1.2mg SL for SBP ≥ 200mmHg",
      "  - Repeat every 3-5min prn x2 for persistent dyspnea",
      "  - Hold if SBP < 100mmHg",
      "Oxygen 15L/min via non-rebreather - If O2 sat <94%"
    ],
    criticalInfo: [
      "Position patient upright if respiratory status allows",
      "Assess blood pressure prior to each nitroglycerin administration",
      "Consider CPAP if severe respiratory distress",
      "Base Hospital Contact: Required for severe respiratory distress unresponsive or not amenable to CPAP"
    ]
  },
  "Inhalation Injury 1236": {
    name: "Inhalation Injury (1236)",
    description: "Smoke inhalation, chemical exposure",
    medications: [
      "Oxygen 15L/min via non-rebreather - If O2 sat <94%",
      "Epinephrine 0.5mg IM - For severe allergic reaction"
    ],
    criticalInfo: [
      "Remove patient from source of exposure",
      "Consider decontamination if chemical exposure",
      "Monitor for delayed respiratory symptoms",
      "Base Hospital Contact: Required for severe respiratory distress unresponsive or not amenable to CPAP"
    ]
  }
};

export function isSOBProtocolMessage(content: string) {
  return content.includes("Select the appropriate respiratory protocol") &&
    content.includes("Airway Obstruction") &&
    content.includes("Respiratory Distress");
}

const ProtocolDetails = memo(function ProtocolDetails({ protocol }: { protocol: ProtocolDef }) {
  return (
    <div className="protocol-dropdown" style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '8px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>Medications:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {protocol.medications.map((med, idx) => (
            <li key={idx} style={{ marginBottom: '4px', fontSize: '14px' }}>
              {med}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>Critical Information:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {protocol.criticalInfo.map((info, idx) => (
            <li key={idx} style={{ marginBottom: '4px', fontSize: '14px' }}>
              {info}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const ProtocolCard = memo(function ProtocolCard({ k, protocol, expanded, onToggle }: { k: string; protocol: ProtocolDef; expanded: boolean; onToggle: (k: string) => void }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        className="protocol-button"
        onClick={() => onToggle(k)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 16px',
          marginBottom: '8px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: '#e6e9ee',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {protocol.name}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {protocol.description}
          </div>
        </div>
        <div style={{ fontSize: '20px' }}>
          {expanded ? <ChevronDown size={20} strokeWidth={2} /> : <ChevronRight size={20} strokeWidth={2} />}
        </div>
      </button>
      {expanded && <ProtocolDetails protocol={protocol} />}
    </div>
  );
});

function SOBSelector({ protocols }: { protocols: Record<string, ProtocolDef> }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) => setExpanded(expanded === key ? null : key);
  return (
    <div>
      <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>
        Select the appropriate respiratory protocol:
      </div>
      {Object.entries(protocols).map(([key, protocol]) => (
        <ProtocolCard key={key} k={key} protocol={protocol} expanded={expanded === key} onToggle={toggle} />
      ))}
    </div>
  );
}

export function SOBProtocolGateway({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <div>
      <SOBSelector protocols={SOB_PROTOCOLS} />
      <div className="quickBar" aria-label="Quick protocol send">
        {Object.keys(SOB_PROTOCOLS).map(k => (
          <button key={k} className="quickChip" onClick={() => onSelect(k)}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

export const MessageItem = memo(function MessageItem({ m, onProtocolSelect }: { m: { role: "user" | "assistant"; content: string }; onProtocolSelect: (key: string) => void }) {
  if (!isSOBProtocolMessage(m.content)) {
    // Use ProtocolFormatter for assistant messages
    if (m.role === "assistant") {
      return <ProtocolFormatter content={m.content} />;
    }
    // User messages - simple, clean text display
    return (
      <div className="user-message-content">
        {m.content}
      </div>
    );
  }
  return <SOBProtocolGateway onSelect={onProtocolSelect} />;
}, (prevProps, nextProps) => {
  // Only re-render if content changed
  return prevProps.m.content === nextProps.m.content;
});



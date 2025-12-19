"use client";

import { ExternalLink, MessageSquare } from "lucide-react";

export interface ProtocolMatch {
  tp_code: string;
  tp_code_pediatric?: string;
  tp_name: string;
  pi_name?: string;
  score?: number;
  matchReasons?: string[];
}

export interface ProtocolCardProps {
  protocol: ProtocolMatch;
  patientAge?: number;
  onUseInChat?: (code: string) => void;
  recommended?: boolean;
}

/**
 * Protocol recommendation card for display in chat
 */
export function ProtocolCard({
  protocol,
  patientAge,
  onUseInChat,
  recommended = false,
}: ProtocolCardProps) {
  // Use pediatric code if patient is under 18 and pediatric code exists
  const effectiveCode =
    patientAge !== undefined && patientAge < 18 && protocol.tp_code_pediatric
      ? protocol.tp_code_pediatric
      : protocol.tp_code;

  const handleViewProtocol = () => {
    // Open LA County PCM protocol page (or fallback to search)
    const url = `https://file.lacounty.gov/SDSInter/dhs/1143706_2024PCMPublic.pdf#search=${effectiveCode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleUseInChat = () => {
    if (onUseInChat) {
      onUseInChat(`Tell me about protocol ${effectiveCode} - ${protocol.tp_name}`);
    }
  };

  return (
    <div className={`protocol-card ${recommended ? "recommended" : ""}`}>
      <div className="protocol-card-header">
        <span className="protocol-code">TP {effectiveCode}</span>
      </div>
      <h3 className="protocol-name">{protocol.tp_name}</h3>

      {protocol.pi_name && (
        <p className="protocol-match-reasons">
          Provider Impression: {protocol.pi_name}
        </p>
      )}

      {protocol.matchReasons && protocol.matchReasons.length > 0 && (
        <p className="protocol-match-reasons">
          Matched: {protocol.matchReasons.join(", ")}
        </p>
      )}

      <div className="protocol-actions">
        <button
          type="button"
          className="protocol-action-btn primary"
          onClick={handleViewProtocol}
        >
          <ExternalLink size={16} />
          View Protocol
        </button>
        {onUseInChat && (
          <button
            type="button"
            className="protocol-action-btn secondary"
            onClick={handleUseInChat}
          >
            <MessageSquare size={16} />
            Ask About
          </button>
        )}
      </div>
    </div>
  );
}

export interface ProtocolCardListProps {
  protocols: ProtocolMatch[];
  patientAge?: number;
  onUseInChat?: (code: string) => void;
  title?: string;
}

/**
 * List of protocol cards
 */
export function ProtocolCardList({
  protocols,
  patientAge,
  onUseInChat,
  title = "Recommended Protocols",
}: ProtocolCardListProps) {
  if (!protocols || protocols.length === 0) {
    return null;
  }

  return (
    <div className="protocol-card-list">
      {title && <h4 className="protocol-list-title">{title}</h4>}
      {protocols.map((protocol, index) => (
        <ProtocolCard
          key={`${protocol.tp_code}-${index}`}
          protocol={protocol}
          patientAge={patientAge}
          onUseInChat={onUseInChat}
          recommended={index === 0}
        />
      ))}
    </div>
  );
}

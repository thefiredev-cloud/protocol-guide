"use client";

import { MaterialIcon } from "../ui/material-icon";

export interface ProtocolMatch {
  tp_code: string;
  tp_code_pediatric?: string;
  tp_name: string;
  pi_name?: string;
  score?: number;
  matchReasons?: string[];
}

export interface ProtocolSection {
  title: string;
  content: string;
}

export interface ProtocolCardProps {
  protocol: ProtocolMatch;
  patientAge?: number;
  onUseInChat?: (code: string) => void;
  recommended?: boolean;
  sections?: ProtocolSection[];
  content?: string;
}

function ProtocolSections({ sections }: { sections: ProtocolSection[] }) {
  return (
    <div className="space-y-4 mb-3">
      {sections.map((section, index) => (
        <div
          key={index}
          className="relative pl-3 border-l-2 border-primary/30 dark:border-primary/50"
        >
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-1">
            {section.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProtocolContent({ content }: { content: string }) {
  return (
    <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 space-y-2">
      {content.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
}

function ProtocolMetadata({ protocol }: { protocol: ProtocolMatch }) {
  return (
    <>
      {protocol.pi_name && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Provider Impression: {protocol.pi_name}
        </p>
      )}
      {protocol.matchReasons && protocol.matchReasons.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Matched: {protocol.matchReasons.join(", ")}
        </p>
      )}
    </>
  );
}

/**
 * Protocol recommendation card for display in chat
 */
export function ProtocolCard({
  protocol,
  patientAge,
  onUseInChat,
  sections,
  content,
}: ProtocolCardProps) {
  const effectiveCode =
    patientAge !== undefined && patientAge < 18 && protocol.tp_code_pediatric
      ? protocol.tp_code_pediatric
      : protocol.tp_code;

  const handleViewProtocol = () => {
    const url = "https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleUseInChat = () => {
    if (onUseInChat) {
      onUseInChat(`Tell me about protocol ${effectiveCode} - ${protocol.tp_name}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-soft">
      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
        Reference <strong className="text-primary font-bold">TP {effectiveCode}: {protocol.tp_name}</strong>
      </p>

      {sections && sections.length > 0 && <ProtocolSections sections={sections} />}
      {!sections && content && <ProtocolContent content={content} />}
      {!sections && !content && <ProtocolMetadata protocol={protocol} />}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleViewProtocol}
          className="flex items-center gap-2 text-primary dark:text-red-400 text-xs font-semibold hover:underline"
        >
          <MaterialIcon name="open_in_new" size={16} />
          View Full Protocol {effectiveCode}
        </button>
      </div>

      {onUseInChat && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleUseInChat}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-primary dark:hover:text-red-400 transition-colors"
          >
            <MaterialIcon name="chat_bubble" size={16} />
            Ask About This Protocol
          </button>
        </div>
      )}
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
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h4>
      )}
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

export type SearchResult = {
  id: number;
  protocolNumber: string;
  protocolTitle: string;
  section: string | null;
  content: string;
  fullContent: string;
  sourcePdfUrl: string | null;
  relevanceScore: number;
  countyId: number;
  // Protocol currency information
  protocolEffectiveDate: string | null;
  lastVerifiedAt: string | null;
  protocolYear: number | null;
};

export type Message = {
  id: string;
  type: "user" | "assistant" | "summary" | "error";
  text: string;
  protocolTitle?: string;
  protocolNumber?: string;
  protocolYear?: number;
  sourcePdfUrl?: string | null;
  protocolRefs?: string[];
  timestamp: Date;
  isOffline?: boolean;
};

export type Agency = {
  id: number;
  name: string;
  state: string;
  protocolCount?: number;
};

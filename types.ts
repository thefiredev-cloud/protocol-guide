

export type ProtocolCategory =
  | 'General Medical'
  | 'Cardiovascular'
  | 'Trauma'
  | 'Respiratory'
  | 'Neurology'
  | 'Environmental'
  | 'Toxicology'
  | 'OB/GYN'
  | 'ENT'
  | 'Pediatric'
  | 'Pharmacology'
  | 'Procedures'
  | 'Policies'
  | 'Administrative'
  | 'Cardiac'
  | 'General'
  | 'Record Keeping'
  | 'Equipment'
  | 'Training'
  | 'Disaster'
  | 'Provider Agencies'
  | 'Base Hospital'
  | 'Medical'
  | 'Behavioral'
  | 'Calculations'
  | 'Medical Control'
  | 'OB'
  | 'Medication'
  | 'Curriculum';

export type SectionType = 'header' | 'meta' | 'warning' | 'text' | 'list' | 'accordion' | 'link-list' | 'definitions' | 'info' | 'calculator' | 'pediatric-dosing' | 'section' | 'alert' | 'step-by-step' | 'facility-finder';

// Facility finder types for hospital capability filtering
export type FacilityFinderType = 'trauma' | 'pediatric' | 'stemi' | 'stroke' | 'burn' | 'ecmo';

// Procedure step for step-by-step sections
export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  substeps?: string[];
  warning?: string;
  tip?: string;
  duration?: string;
}

export interface ProtocolSectionItem {
  title?: string;
  subtitle?: string;
  content?: string; // HTML allowed
  listItems?: string[];
  icon?: string;
  color?: string; // Tailwind color name
  imageUrl?: string; // URL to procedure/training image
  imageAlt?: string; // Accessibility alt text
  imageCaption?: string; // Optional caption below image
}

export interface ProtocolSection {
  type: SectionType;
  title?: string; // Section header
  icon?: string;
  items?: ProtocolSectionItem[]; // For accordions, lists
  content?: string; // For text blocks
  data?: Record<string, string>; // For meta (Scope: County-wide)
  className?: string; // specific styling overrides
  steps?: ProcedureStep[]; // For step-by-step sections
  facilityTypes?: FacilityFinderType[]; // For facility-finder sections
}

export interface Protocol {
  id: string;
  refNo: string;
  title: string;
  category: ProtocolCategory;
  type?: string;
  lastUpdated: string;
  tags?: string[];
  icon: string;
  color: string; // Tailwind base color e.g. "red", "blue"
  sections: ProtocolSection[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  isDelivered?: boolean;
}

export enum Tab {
  Assistant = 'assistant',
  Protocols = 'protocols',
  Mic = 'mic',
  Hospitals = 'hospitals',
  Account = 'account'
}

// Auth types
export interface User {
  email: string;
  name: string;
  department: string;
  employeeId: string;
  station: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
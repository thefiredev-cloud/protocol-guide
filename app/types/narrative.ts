/**
 * Narrative data types for protocol responses and medical documentation
 */

export interface NarrativeData {
  chief_complaint?: string;
  assessment?: string;
  interventions?: string[];
  medications?: string[];
}


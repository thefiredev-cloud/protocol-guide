import { createLogger } from '../log';
import { searchKB } from '../retrieval';
import type { Protocol, ProtocolChunk } from './protocol-schema';

const logger = createLogger('ProtocolHelpers');

interface ProtocolMetadataEntry {
  tpCode?: string;
  protocolCodes?: string[];
  [key: string]: unknown;
}

/**
 * Load protocol from file system
 */
export async function loadProtocolFromFiles(tpCode: string): Promise<Protocol | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const metadataPath = path.join(process.cwd(), 'data', 'protocol-metadata.json');
    const data = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(data) as ProtocolMetadataEntry[];

    // Find protocol by tpCode in protocolCodes array
    const proto = metadata.find((p: ProtocolMetadataEntry) =>
      p.protocolCodes?.includes(tpCode) ||
      p.tpCode === tpCode
    );

    return proto ? convertToProtocol(proto, tpCode) : null;
  } catch (error) {
    logger.error('Failed to load from files', { tpCode, error });
    return null;
  }
}

/**
 * Search files using MiniSearch
 */
export async function searchProtocolFiles(query: string, limit: number): Promise<ProtocolChunk[]> {
  try {
    const results = await searchKB(query, limit);

    // Convert KBDoc to ProtocolChunk format
    return results.map((doc, index) => ({
      id: doc.id,
      source_type: 'markdown' as const,
      source_file: doc.title,
      chunk_index: index,
      title: doc.title,
      content: doc.content,
      content_hash: '', // Not needed for fallback
      category: doc.category,
      subcategory: doc.subcategory,
      keywords: doc.keywords || [],
      protocol_codes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    logger.error('File search failed', { query, error });
    return [];
  }
}

/**
 * Convert file format to Protocol interface
 */
// eslint-disable-next-line complexity
function convertToProtocol(data: ProtocolMetadataEntry, tpCode: string): Protocol {
  const typed = data as Record<string, unknown>;
  const baseContact = typed.baseContact as { required?: boolean; criteria?: string } | undefined;
  const transport = typed.transport as unknown[] | undefined;

  return {
    id: (typed.id as string) || tpCode,
    tp_code: tpCode,
    tp_name: (typed.title as string) || '',
    tp_category: (typed.category as string) || 'General',
    full_text: (typed.fullText as string) || '',
    summary: (typed.title as string) || '',
    keywords: (typed.keywords as string[]) || [],
    tags: [],
    chief_complaints: (typed.chiefComplaints as string[]) || [],
    conditions: [],
    base_contact_required: baseContact?.required || false,
    base_contact_criteria: baseContact?.criteria,
    transport_destinations: transport ? { destinations: transport } : {},
    warnings: (typed.warnings as string[]) || [],
    contraindications: (typed.contraindications as string[]) || [],
    version: 1,
    effective_date: new Date().toISOString(),
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

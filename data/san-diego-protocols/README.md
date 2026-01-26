# San Diego County EMS Protocols

## Downloaded Files

| File | Size | Source |
|------|------|--------|
| `2025-2026_Protocol_Packet.pdf` | 1.96 MB (2,053,749 bytes) | [San Diego County EMS](https://www.sandiegocounty.gov/content/dam/sdc/ems/Policies_Protocols/2025/2025-2026%20Protocol%20Packet.pdf) |

## Downloaded

- **Date**: 2025-01-25
- **MD5**: FAB6778700F360DE31DD1D2537DE4D1C

## Ingestion Script

Import script created: `scripts/import-san-diego-protocols.ts`

### Usage

```bash
# Dry run (preview what will be imported)
npx tsx scripts/import-san-diego-protocols.ts --local --dry-run

# Import without embeddings (faster testing)
npx tsx scripts/import-san-diego-protocols.ts --local --skip-embed

# Full import with embeddings
npx tsx scripts/import-san-diego-protocols.ts --local
```

### Required Environment Variables

Set these in `.env` or environment:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VOYAGE_API_KEY=your_voyage_api_key  # For embeddings
```

### Target Database

- **Table**: `manus_protocol_chunks`
- **Agency Name**: `San Diego County EMS`
- **State Code**: `CA`
- **Protocol Year**: 2025

## Protocol Structure (Expected)

San Diego County typically uses:
- Policy numbers (P-###)
- Section-based organization
- Clinical protocols for various conditions

The import script will:
1. Parse the PDF using pdf-parse
2. Extract protocols by detecting headers and sections
3. Chunk content semantically (preserving medical context)
4. Generate embeddings via Voyage AI
5. Insert into Supabase manus_protocol_chunks table

## Notes

This is a comprehensive protocol packet covering 2025-2026. It may contain:
- Administrative policies
- Treatment protocols (cardiac, trauma, pediatric, etc.)
- Medication references
- Scope of practice guidelines
- Transport/destination policies

# Knowledge Base Chunking

## Overview

The County Medic knowledge base has been optimized by splitting the large 10.5MB `markdown.json` file into 21 category-specific chunks, each under 2MB for efficient loading.

## Chunk Categories

### Clinical Protocols
- **Airway** (147KB, 97 docs) - Airway management protocols (Reference 1100-1139)
- **Cardiac** (683KB, 421 docs) - Cardiac protocols (Reference 1200-1229)
- **Trauma** (787KB, 484 docs) - Trauma protocols (Reference 1300-1369)
- **Medications** (154KB, 109 docs) - Medication protocols (Reference 1317.x)
- **Pediatrics** (142KB, 86 docs) - Pediatric protocols (Reference 1400+)
- **Respiratory** (149KB, 88 docs) - Respiratory conditions
- **Environmental** (160KB, 96 docs) - Environmental emergencies
- **Obstetric** (369KB, 220 docs) - Obstetric/gynecologic protocols
- **Toxicology** (131KB, 81 docs) - Poisoning and overdose protocols

### Equipment & Procedures
- **Equipment** (70KB, 46 docs) - Equipment and device protocols (Reference 1000-1099)
- **General-protocols** (90KB, 56 docs) - General medical protocols

### Administrative
- **Admin-facilities** (252KB, 154 docs) - Facilities & systems (Reference 300-399)
- **Admin-provider** (277KB, 171 docs) - Provider certification (Reference 400-499)
- **Admin-training** (266KB, 173 docs) - Training & education (Reference 500-599)
- **Admin-quality** (1.8MB, 1081 docs) - Quality & performance (Reference 600-699)
- **Admin-operations** (111KB, 73 docs) - Field operations (Reference 700-799)
- **Admin-events** (252KB, 162 docs) - Special events (Reference 800-899)
- **Admin-policy** (87KB, 55 docs) - General policies (Reference 900-999)
- **Admin-general** (1.2MB, 781 docs) - Other administrative content

### Reference Materials
- **Reference** (1.9MB, 1171 docs) - Standards, forms, data dictionaries
- **General** (1.3MB, 813 docs) - Miscellaneous documents

### Existing Chunks (preserved)
- **Medication** (86KB, 19 docs) - Medication reference
- **Protocol** (15KB, 3 docs) - Protocol templates
- **Pediatric Dosing** (230KB, 572 docs) - Pediatric dosing tables

## Running the Script

```bash
cd /Users/tanner-osterkamp/Medic-Bot
node scripts/chunk-markdown-by-category.mjs
```

The script will:
1. Read `public/kb/chunks/markdown.json`
2. Categorize documents based on reference numbers and content
3. Create category-specific JSON files
4. Update `public/kb/manifest.json`

## Intelligent Chunk Loading

The updated `lib/storage/knowledge-base-chunked.ts` includes:

### Auto-Detection
The `search()` method automatically detects which chunks to load based on query content:
- Drug names → Medications
- "cardiac", "heart", "arrest" → Cardiac
- "airway", "intubation" → Airway + Respiratory
- "trauma", "bleeding" → Trauma
- "pediatric", "child" → Pediatrics + Pediatric Dosing
- Protocol numbers (e.g., "1200") → General-protocols

### Smart Search
The `smartSearch()` method automatically expands to additional chunks if initial results are insufficient.

### Preloading
Essential chunks are preloaded on initialization:
- Medication
- Medications
- Cardiac
- Airway
- Pediatric Dosing
- Protocol

## Benefits

1. **Fast Initial Load**: No need to load 10.5MB on startup
2. **Memory Efficient**: Only load relevant content for each query
3. **Better Caching**: IndexedDB can cache smaller chunks more efficiently
4. **Progressive Enhancement**: Essential content loads first, specialized content on-demand
5. **Improved Performance**: Searches are faster with smaller in-memory datasets

## Maintenance

To regenerate chunks after updating source protocols:
1. Ensure `markdown.json` is in `public/kb/chunks/`
2. Run the chunking script
3. The script will replace old category chunks with fresh data
4. Delete `markdown.json` after successful chunking

## Category Detection Logic

Categories are determined in priority order:
1. **Medications** - Reference 1317, drug names
2. **Cardiac** - Reference 1200-1229
3. **Airway** - Reference 1100-1139
4. **Trauma** - Reference 1300-1369 (excluding 1317)
5. **Pediatrics** - Reference 1400+
6. **Respiratory** - Respiratory conditions
7. **Environmental** - Environmental emergencies
8. **Obstetric** - Pregnancy/delivery
9. **Toxicology** - Poisoning/overdose
10. **Equipment** - Reference 1000-1099
11. **General-protocols** - Protocols with 4-digit reference numbers
12. **Admin-*** - Administrative references by range
13. **Reference** - Standards, forms, guidelines
14. **General** - Everything else

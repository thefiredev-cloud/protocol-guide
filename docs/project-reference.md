# Galls Gear Assistant - Project Reference

## Overview

The Galls Gear Assistant is a comprehensive EMS protocol assistant designed for fire and first responders. It provides instant access to Los Angeles County EMS protocols, pediatric color code dosing, and emergency medical procedures through an intelligent chat interface.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.4.5
- **Search Engine**: MiniSearch 7.1.0 (BM25 algorithm)
- **AI Integration**: OpenAI-compatible API endpoints
- **Styling**: CSS Modules with Tailwind-like utilities

### Core Components

#### 1. Knowledge Base System
- **Primary Data Source**: `data/ems_kb.json`
- **Search Engine**: BM25-based retrieval using MiniSearch
- **Content Types**:
  - LA County EMS Protocols (47 protocols)
  - Pediatric Color Code Dosing (MCG 1309)
  - Hospital Capabilities Directory
  - Trauma Triage Criteria
  - Provider Impressions

#### 2. API Layer
- **Endpoint**: `/api/chat`
- **Method**: POST
- **Functionality**:
  - Receives user queries
  - Performs semantic search on knowledge base
  - Retrieves top 6 most relevant chunks
  - Sends context to LLM with system prompt
  - Returns formatted response

#### 3. User Interface
- **Framework**: React 18.3.1
- **Features**:
  - Real-time chat interface
  - Protocol selection for SOB cases
  - Voice-command optimized responses
  - Mobile-responsive design

## Key Features

### 1. Comprehensive Protocol Coverage
- **47 LA County EMS Protocols** covering all medical emergencies
- **Quick bullet-point format** for rapid field reference
- **Base contact requirements** clearly marked (YES/NO)
- **Critical action prioritization**

### 2. Pediatric Color Code System (MCG 1309)
- **Complete weight-based dosing** for all medications
- **Color-coded system**: Grey (3-5kg) → Green (30-36kg)
- **Exact calculations** for:
  - Medication dosages (mg and mL)
  - Cardioversion/Defibrillation settings
  - Normal saline bolus volumes
  - Vital sign parameters

### 3. Specialized Query Handling
- **Symptom-based protocol selection** (SOB, chest pain, stroke, etc.)
- **Hospital capability lookups** (STEMI centers, trauma centers, burn centers)
- **Trauma triage criteria** (Section I, II, III)
- **PMC criteria** for pediatric patients

### 4. Advanced Search Capabilities
- **Semantic search** across all protocols
- **Context-aware responses**
- **Multi-keyword matching**
- **Protocol-specific filtering**

## Data Structure

### Knowledge Base Schema
```typescript
interface KBDoc {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  content: string;
}
```

### Protocol Categories
- **Cardiac**: Chest pain, cardiac arrest, bradycardia, tachycardia
- **Respiratory**: SOB, bronchospasm, pulmonary edema, inhalation injury
- **Neurological**: Stroke, seizure, ALOC, syncope
- **Trauma**: Triage criteria, trauma centers
- **Pediatric**: Color code dosing, PMC criteria
- **Specialized**: Allergic reactions, overdose, hospital capabilities

## System Prompt Engineering

### Core Instructions
1. **Protocol Compliance**: Always use LA County EMS approved protocols
2. **Exact Dosing**: Use pre-calculated values from MCG 1309
3. **Safety First**: Prioritize critical actions and contraindications
4. **Field Optimization**: Format responses for quick scanning

### Specialized Query Types
- **Medication Dosing**: Direct answers with exact mg/mL values
- **Protocol Selection**: Structured format with actions and base contact
- **Hospital Lookups**: Capability verification with specific centers
- **Trauma Triage**: Section-based criteria with specific parameters

## File Structure

```
galls-gear-assistant/
├── app/
│   ├── api/chat/route.ts          # Main API endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main UI component
├── data/
│   ├── ems_kb.json                # Primary knowledge base
│   ├── ems_epinephrine_dosing.json # Epinephrine-specific data
│   └── provider_impressions.json  # Provider impression data
├── lib/
│   ├── prompt.ts                  # System prompt configuration
│   └── retrieval.ts               # Search and retrieval logic
├── package.json                   # Dependencies and scripts
└── README.md                      # Basic documentation
```

## Configuration

### Environment Variables
- `LLM_API_KEY`: API key for LLM service
- `LLM_BASE_URL`: Base URL for LLM API (default: OpenAI)
- `LLM_MODEL`: Model to use (default: gpt-4o-mini)

### Search Configuration
- **Top Results**: 6 most relevant chunks
- **Search Fields**: title, content, keywords
- **Temperature**: 0.2 (for consistent responses)

## Usage Examples

### Basic Protocol Query
```
User: "What's the protocol for chest pain?"
Response: Protocol 1211 - Cardiac Chest Pain with actions, medications, and base contact requirements
```

### Pediatric Dosing Query
```
User: "6kg pink morphine dose"
Response: "0.6 mg (0.15 mL) IV/IM/IO"
```

### Hospital Capability Query
```
User: "Is Cedars a trauma center?"
Response: "Yes, Cedars Sinai Medical Center is a Level I trauma center."
```

### SOB Protocol Selection
```
User: "Patient with shortness of breath"
Response: Protocol selection menu with 5 specific SOB protocols
```

## Development Workflow

### Adding New Protocols
1. Add entry to `data/ems_kb.json`
2. Include relevant keywords for searchability
3. Update system prompt if needed
4. Test with various query formats

### Updating Pediatric Dosing
1. Modify `data/ems_kb.json` with new weight/color combinations
2. Update keywords array to include new weights
3. Add explicit instructions to `lib/prompt.ts`
4. Test with specific weight queries

### Testing
- Use `curl` commands to test API endpoints
- Verify search results return correct protocols
- Check response formatting for field usability
- Validate medication dosing accuracy

## Performance Considerations

### Search Optimization
- **Indexing**: Built once on server startup
- **Caching**: Search results cached in memory
- **Query Processing**: BM25 algorithm for relevance scoring

### Response Time
- **Target**: <2 seconds for most queries
- **Optimization**: Pre-calculated dosing values
- **Caching**: Static knowledge base with dynamic search

## Security & Compliance

### Data Protection
- **Local Storage**: All data stored locally in JSON files
- **No PII**: No personal information stored
- **API Security**: Environment variable protection

### Medical Disclaimer
- **Educational Purpose**: For reference and training only
- **Not Medical Advice**: Does not replace proper medical training
- **Protocol Compliance**: Always follow official LA County EMS protocols

## Future Enhancements

### Planned Features
- **Streaming Responses**: Real-time response delivery
- **Voice Integration**: Hands-free operation
- **Offline Mode**: Local processing without API calls
- **Multi-language Support**: Spanish protocol translations

### Technical Improvements
- **Database Integration**: Supabase + pgvector for scalable search
- **Advanced Analytics**: Query tracking and optimization
- **Mobile App**: Native iOS/Android applications
- **Integration APIs**: Connect with existing EMS systems

## Troubleshooting

### Common Issues
1. **Search Not Finding Results**: Check keywords in knowledge base
2. **Incorrect Dosing**: Verify MCG 1309 data accuracy
3. **API Errors**: Check environment variables and API key
4. **Slow Responses**: Optimize search queries and reduce context size

### Debug Tools
- **API Testing**: Use curl commands for endpoint testing
- **Search Debugging**: Check MiniSearch index and query results
- **Response Validation**: Verify system prompt instructions

## Support & Maintenance

### Regular Updates
- **Protocol Updates**: Quarterly review of LA County EMS changes
- **Dosing Verification**: Annual validation of pediatric calculations
- **System Updates**: Monthly dependency and security updates

### Monitoring
- **Query Logs**: Track common queries and response accuracy
- **Performance Metrics**: Monitor response times and error rates
- **User Feedback**: Collect field usage feedback for improvements
- **Health Diagnostics**: `/api/health` returns KB scope, doc count, resolution attempts (local vs remote), last successful source, and LLM configuration snapshot. `scripts/smoke.js` prints this data for deployment pipelines.

---

*This document serves as a comprehensive reference for the Galls Gear Assistant project. For specific implementation details, refer to the source code and inline documentation.*


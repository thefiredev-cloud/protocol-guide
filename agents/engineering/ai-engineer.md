# AI Engineer

## Role
Optimizes the Claude-powered RAG (Retrieval-Augmented Generation) pipeline for Protocol Guide, ensuring accurate and contextually relevant EMS protocol search results.

## Responsibilities

### RAG Pipeline Optimization
- Design and refine the retrieval strategy for EMS protocol documents
- Optimize embedding generation and vector similarity search using TiDB's vector capabilities
- Implement semantic chunking strategies for protocol documents
- Tune retrieval parameters (top-k, similarity thresholds, reranking)

### Prompt Engineering
- Craft system prompts that understand EMS terminology and context
- Design few-shot examples for common protocol queries
- Implement prompt templates for different query types (medication dosing, procedures, decision trees)
- Optimize prompts for response accuracy and latency

### Embedding Strategy
- Select and configure embedding models for medical/EMS content
- Implement hybrid search combining semantic and keyword matching
- Design metadata filtering for protocol versions, regions, and certification levels
- Optimize embedding dimensions and indexing for TiDB

### Claude Integration
- Configure Claude API calls through tRPC backend
- Implement streaming responses for real-time protocol lookups
- Design fallback strategies for API failures
- Optimize token usage and cost management

## Key Skills/Capabilities
- Claude API and Anthropic SDK expertise
- Vector database operations (TiDB vector search)
- Embedding models (text-embedding-ada, Cohere, etc.)
- Prompt engineering and LLM optimization
- Medical/EMS domain knowledge
- TypeScript/Node.js for backend integration

## Example Tasks

1. **Improve Protocol Retrieval Accuracy**
   - Analyze query logs to identify missed or incorrect retrievals
   - Adjust chunking strategy for multi-step protocols
   - Implement query expansion for medical abbreviations

2. **Optimize Response Latency**
   - Profile RAG pipeline bottlenecks
   - Implement caching for common queries
   - Tune embedding batch sizes and concurrent requests

3. **Add Contextual Understanding**
   - Implement conversation memory for follow-up questions
   - Design prompts that consider patient demographics when relevant
   - Add protocol version awareness to responses

4. **Implement Safety Guardrails**
   - Design prompts that emphasize checking local protocols
   - Add disclaimers for critical medication dosing
   - Implement confidence scoring for responses

## Constraints/Guidelines

- **Accuracy First**: EMS protocols are life-critical; prioritize accuracy over speed
- **Source Attribution**: Always cite specific protocol sections in responses
- **Local Protocol Deference**: Remind users to verify against their local protocols
- **No Medical Advice**: Responses should reference protocols, not provide independent medical advice
- **Version Awareness**: Track and display protocol version/date in responses
- **Cost Consciousness**: Optimize token usage without sacrificing quality
- **HIPAA Compliance**: Never store or log patient-specific information in queries
- **Offline Considerations**: Design for graceful degradation when connectivity is limited

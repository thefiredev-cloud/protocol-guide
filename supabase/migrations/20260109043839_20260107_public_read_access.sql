-- Add public (anonymous) read access for RAG functionality
-- Protocol Guide needs public access for the chat interface

-- Allow anonymous users to read protocols
CREATE POLICY "protocols_select_anon" ON protocols
  FOR SELECT TO anon USING (true);

-- Allow anonymous users to read medications
CREATE POLICY "medications_select_anon" ON medications
  FOR SELECT TO anon USING (true);

-- Allow anonymous users to read protocol chunks (critical for RAG)
CREATE POLICY "chunks_select_anon" ON protocol_chunks
  FOR SELECT TO anon USING (true);

-- Allow anonymous users to read audit log
CREATE POLICY "audit_select_anon" ON verification_audit
  FOR SELECT TO anon USING (true);
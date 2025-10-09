#!/usr/bin/env node
import { spawn } from 'node:child_process';

const mode = process.argv[2] || 'chat';
const url = mode === 'chat' ? 'http://localhost:3000/api/chat' : 'http://localhost:3000/api/dosing';
const payload = mode === 'chat'
  ? JSON.stringify({ messages: [{ role: 'user', content: 'Chest pain, SBP 100, shortness of breath' }], mode: 'chat' })
  : JSON.stringify({ medicationId: 'epinephrine', request: { patientWeightKg: 70, scenario: 'push' } });

const start = Date.now();
const curl = spawn('curl', ['-s', '-X', 'POST', '-H', 'Content-Type: application/json', '-d', payload, url]);

let data = '';
curl.stdout.on('data', (chunk) => { data += chunk.toString(); });
curl.on('close', (code) => {
  const ms = Date.now() - start;
  console.log(`[profile] ${mode} -> ${ms} ms, exit=${code}`);
  try { console.log(JSON.parse(data)); } catch { console.log(data); }
});



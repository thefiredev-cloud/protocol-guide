/**
 * Add User: Carter (christiansafina@gmail.com)
 * Creates admin user in Supabase Auth and public.users table
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual environment variable loading from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.warn('Warning: Could not load .env.local');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addUser() {
  const email = 'christiansafina@gmail.com';
  const password = 'Carter123';
  const fullName = 'Carter';
  const role = 'admin';

  console.log(`Adding user: ${email}...`);

  // Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    throw listError;
  }

  const existingUser = users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log(`User ${email} already exists in Auth (ID: ${existingUser.id}). Syncing profile...`);
    await syncProfile(existingUser.id, email, fullName, role);
  } else {
    console.log(`Creating new auth user: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError.message);
      throw authError;
    }

    console.log('Auth user created successfully.');
    await syncProfile(authData.user.id, email, fullName, role);
  }
}

async function syncProfile(userId: string, email: string, fullName: string, role: string) {
  console.log(`Syncing profile for ${email} (${userId})...`);

  const { error: profileError } = await supabase.from('users').upsert({
    id: userId,
    email: email,
    full_name: fullName,
    role: role as any,
    department: 'lacfd'
  }, {
    onConflict: 'email'
  });

  if (profileError) {
    console.error('Error syncing profile:', profileError.message);
    throw profileError;
  }

  console.log('User profile synced successfully.');
  console.log(`\nUser added: ${fullName}`);
  console.log(`Email: ${email}`);
  console.log(`Role: ${role}`);
}

addUser().catch(error => {
  console.error('Failed:', error.message);
  process.exit(1);
});

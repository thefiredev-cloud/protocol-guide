/**
 * Setup Admin User Script
 * Creates the initial admin user in Supabase Auth and public.users table
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
  console.warn('⚠️ Warning: Could not load .env.local');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  const email = 'tanner@thefiredev.com';
  const password = 'jackie99';
  const fullName = 'Tanner Osterkamp';

  console.log(`🚀 Setting up admin user: ${email}...`);

  // 1. Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    throw listError;
  }

  const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log(`ℹ️ User ${email} already exists in Auth (ID: ${existingUser.id}). Syncing profile...`);
    await syncProfile(existingUser.id, email, fullName, password);
  } else {
    console.log(`🆕 Creating new auth user: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      throw authError;
    }

    console.log('✅ Auth user created successfully.');
    await syncProfile(authData.user.id, email, fullName, password);
  }
}

async function syncProfile(userId: string, email: string, fullName: string, password?: string) {
  console.log(`🔄 Syncing profile for ${email} (${userId})...`);

  const { error: profileError } = await supabase.from('users').upsert({
    id: userId,
    email: email,
    full_name: fullName,
    role: 'admin' as any, // Cast to any because the SDK might not know the enum yet
    department: 'lacfd'
  }, {
    onConflict: 'email'
  });

  if (profileError) {
    console.error('❌ Error syncing profile:', profileError.message);
    throw profileError;
  }

  console.log('✅ User profile synced successfully.');
  console.log('\n✨ Admin setup complete!');
  console.log(`Email: ${email}`);
  if (password) console.log(`Password: ${password}`);
}

setupAdmin().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});

/* eslint-disable */
/// <reference lib="deno.ns" />
/// <reference lib="dom" />

// Import required libraries and modules
import { assert } from 'https://deno.land/std@0.192.0/testing/asserts.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { config } from 'https://deno.land/x/dotenv@v3.2.2/mod.ts';

// Load environment variables from the functions directory
const envPath = new URL('../.env', import.meta.url).pathname;
const env = await config({ path: envPath });

// Set up the configuration for the Supabase client
const dbUrl = env['DB_URL'] ?? '';
const dbKey = env['DB_SERVICE_KEY'] ?? '';
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

// Test the database connectivity
const testDatabaseConnectivity = async () => {
  console.log('Testing with URL:', dbUrl);
  console.log('Service Key present:', !!dbKey);

  const client = createClient(dbUrl, dbKey, options);

  // Verify if the URL and key are provided
  if (!dbUrl) throw new Error('DB_URL is required.');
  if (!dbKey) throw new Error('DB_SERVICE_KEY is required.');

  // Test a simple query to the database
  const { data: analyses, error: table_error } = await client
    .from('idea_analyses')
    .select('id')
    .limit(1);

  if (table_error) {
    console.error('Database query failed:', table_error);
    throw table_error;
  }

  assert(analyses, 'Data should be returned from the query.');
  console.log('Database connectivity test passed!');
  console.log('Sample data:', analyses);
};

// Register and run the test
Deno.test('Database Connectivity Test', testDatabaseConnectivity);

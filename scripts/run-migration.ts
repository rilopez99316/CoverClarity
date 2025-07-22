import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read the migration SQL file
  const migrationPath = join(
    __dirname, 
    '../supabase/migrations/20250721193700_add_document_urls_to_policies.sql'
  );
  
  const sql = readFileSync(migrationPath, 'utf-8');
  
  try {
    console.log('Running migration...');
    const { data, error } = await supabase.rpc('pgmigrate', { sql });
    
    if (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully:', data);
  } catch (error) {
    console.error('Failed to run migration:', error);
    process.exit(1);
  }
}

runMigration();

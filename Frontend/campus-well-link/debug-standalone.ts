import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugResource() {
    try {
        console.log('Querying resources...');
        const { data, error } = await supabase
            .from('resources')
            .select('id, title')
            .ilike('title', '%Mindfulness%');

        if (error) {
            console.error('Query failed:', error);
            return;
        }

        console.log('Found resources:', data?.length);
        data?.forEach(r => {
            console.log(`ID: ${r.id}`);
            console.log(`Title: "${r.title}"`);
            console.log(`Length: ${r.title.length}`);
            console.log('Char codes:', r.title.split('').map((c: string) => c.charCodeAt(0)).join(', '));

            const normalized = r.title.trim().toLowerCase();
            console.log(`Normalized: "${normalized}"`);
            console.log(`Matches target?: ${normalized === 'mindfulness meditation for beginners'}`);
            console.log('---');
        });

    } catch (e) {
        console.error('Script failed:', e);
    }
}

debugResource();

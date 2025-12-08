import { supabase } from '@/integrations/supabase/client';

// Debug: Log the Supabase configuration
console.log('=== SUPABASE DEBUG ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key (first 20 chars):', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20));
console.log('Supabase client:', supabase);

// Test connection
// Test connection and fetch resource details
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
            console.log('Char codes:', r.title.split('').map(c => c.charCodeAt(0)).join(', '));

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

export { };

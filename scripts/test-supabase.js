import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking credentials...');
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.error('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('Key:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}
console.log('Credentials found. URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false // Node.js environment doesn't have local storage by default
    }
});

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        // 1. Test Auth (simplest check)
        console.log('1. Testing Auth service...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth error:', authError.message);
        } else {
            console.log('Auth service reachable. Session:', authData.session ? 'Active' : 'None (expected)');
        }

        // 2. Test Database
        console.log('2. Testing Database (table "sites")...');
        const { count, error } = await supabase.from('sites').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Database error:', error.message);
            console.error('Error code:', error.code);
            if (error.code === '42P01') {
                console.log('NOTE: Table "sites" does not exist. This is a valid connection, but the schema is missing.');
            }
        } else {
            console.log(`Database connection successful! Found ${count} rows in "sites".`);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();

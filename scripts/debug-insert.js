
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log('Testing insert...');

    const mockSite = {
        user_id: 'test-user-id',
        author_name: 'Test Author',
        title: 'Test Title',
        html_content: '<h1>Hello</h1>',
        views: 0,
        published: true,
        is_public: true,
        allow_source_download: true,
        created_at: Date.now(),
        updated_at: Date.now()
    };

    console.log('Inserting payload:', mockSite);

    const { data, error } = await supabase.from('sites').insert(mockSite).select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert successful:', data);
    }
}

testInsert();

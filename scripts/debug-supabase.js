
console.log('Starting script...');
try {
    console.log('Importing supabase...');
    const { createClient } = await import('@supabase/supabase-js');
    console.log('Imported successfully.');
    const supabase = createClient('https://example.com', 'key');
    console.log('Client created.');
} catch (e) {
    console.error('Error:', e);
}

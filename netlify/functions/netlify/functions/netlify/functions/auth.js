const { createClient } = require('@supabase/supabase-js');

// Cek environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
    console.error('ERROR: SUPABASE_URL tidak diset!');
}

if (!supabaseKey) {
    console.error('ERROR: SUPABASE_SERVICE_KEY tidak diset!');
}

// Buat client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };

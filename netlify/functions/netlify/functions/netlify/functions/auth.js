const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    console.log('Function auth invoked with method:', event.httpMethod);
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { 
            statusCode: 200, 
            headers, 
            body: '' 
        };
    }

    // Hanya terima POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse body
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        const { username, password } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Username dan password wajib diisi' })
            };
        }

        console.log('Login attempt for username:', username);

        // Cari user di database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            console.log('User not found:', username);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Username tidak ditemukan' })
            };
        }

        // Cek password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for:', username);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Password salah' })
            };
        }

        // Buat token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'fallback-secret-jangan-pakai-ini',
            { expiresIn: '24h' }
        );

        // Hapus password dari response
        delete user.password;

        console.log('Login successful for:', username);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                token, 
                user 
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error: ' + error.message 
            })
        };
    }
};

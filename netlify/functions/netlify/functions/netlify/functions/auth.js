const { supabase } = require('./supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const { username, password } = body;

        // Cari user di database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Username tidak ditemukan' })
            };
        }

        // Cek password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Password salah' })
            };
        }

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Hapus password dari response
        delete user.password;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ token, user })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
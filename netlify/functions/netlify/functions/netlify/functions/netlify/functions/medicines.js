const { supabase } = require('./supabase');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Verify token
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (event.httpMethod === 'GET') {
            // Ambil semua obat
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .order('name');

            if (error) throw error;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data)
            };
        }

        if (event.httpMethod === 'POST') {
            // Cek admin
            if (decoded.role !== 'admin') {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Admin only' })
                };
            }

            const body = JSON.parse(event.body);
            const { data, error } = await supabase
                .from('medicines')
                .insert([body])
                .select();

            if (error) throw error;
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(data[0])
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
try {
    const url = process.env.DATABASE_URL;
    console.log('Testing with URL:', url ? (url.split('@')[1] || 'No @ found') : 'UNDEFINED');
    const pool = new Pool({ connectionString: url });
    console.log('Pool created successfully');
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Query error:', err.message);
        } else {
            console.log('Query success:', res.rows[0]);
        }
        pool.end();
    });
} catch (e) {
    console.error('Catch error:', e.message);
}

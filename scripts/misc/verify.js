// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function main() {
  const r = await pool.query(`SELECT category, type, COUNT(*) as cnt, SUM(amount) as total FROM "Transaction" WHERE category='PROJECT_FUND' GROUP BY category, type`);
  console.log(JSON.stringify(r.rows, null, 2));
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });

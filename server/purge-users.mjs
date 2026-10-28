import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:CampusFind2026SecurePass@campusfind-db.cr88kq62a0lq.ap-south-1.rds.amazonaws.com:5432/campusfind',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('--- PURGING USERS AND ASSOCIATED DATA FROM RDS ---');
  
  // Clean related tables
  await pool.query('DELETE FROM notifications');
  console.log('Cleared notifications.');

  await pool.query('DELETE FROM audit_events');
  console.log('Cleared audit_events.');

  await pool.query('DELETE FROM claims');
  console.log('Cleared claims.');

  await pool.query('DELETE FROM reports');
  console.log('Cleared reports.');

  const res = await pool.query('DELETE FROM users RETURNING email, role');
  console.log(`Deleted ${res.rows.length} users:`, res.rows.map(u => `${u.email} (${u.role})`));

  const count = await pool.query('SELECT count(*) FROM users');
  console.log('Remaining users in RDS:', count.rows[0].count);

  await pool.end();
}

main().catch(err => {
  console.error('Error purging users:', err);
  process.exit(1);
});

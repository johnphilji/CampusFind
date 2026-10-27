import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:CampusFind2026SecurePass@campusfind-db.cr88kq62a0lq.ap-south-1.rds.amazonaws.com:5432/campusfind',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query(`UPDATE users SET full_name = 'Admin' WHERE role = 'admin'`);
  const admins = await pool.query(`SELECT id, email, role, full_name FROM users WHERE role = 'admin'`);
  console.log('Admins in RDS updated:', admins.rows);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

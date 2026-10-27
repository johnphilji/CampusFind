import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:CampusFind2026SecurePass@campusfind-db.cr88kq62a0lq.ap-south-1.rds.amazonaws.com:5432/campusfind',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const hash = await bcrypt.hash('AdminDesk123!', 10);
  console.log('Generated hash for AdminDesk123!:', hash);

  // Update admin.desk@college.edu
  const res1 = await pool.query(
    `UPDATE users SET password_hash = $1 WHERE email = 'admin.desk@college.edu' RETURNING id, email, role`,
    [hash]
  );
  console.log('Updated admin.desk@college.edu:', res1.rows);

  // Also ensure admin@somaiya.edu or admin@campusfind.edu exists with admin role
  const res2 = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, student_id, department, role, avatar_url, phone_number)
     VALUES ('admin@somaiya.edu', $1, 'Campus Security Administrator', 'ADM-SOMAIYA-01', 'Security & Campus Safety', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', '+91 98200 12345')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
     RETURNING id, email, role`,
    [hash]
  );
  console.log('Updated / Created admin@somaiya.edu:', res2.rows);

  const allAdmins = await pool.query(`SELECT id, email, role, full_name FROM users WHERE role = 'admin'`);
  console.log('Current Admin Accounts in RDS:', allAdmins.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

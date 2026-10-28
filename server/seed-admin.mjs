import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:CampusFind2026SecurePass@campusfind-db.cr88kq62a0lq.ap-south-1.rds.amazonaws.com:5432/campusfind',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const email = 'admin@somaiya.edu';
  const password = 'AdminDesk123!';
  const fullName = 'Campus Administrator';
  const studentId = 'ADMIN-001';
  const department = 'Security & Campus Administration';
  const role = 'admin';

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if exists or insert
  await pool.query('DELETE FROM users WHERE email = $1 OR student_id = $2', [email, studentId]);

  const res = await pool.query(`
    INSERT INTO users (email, password_hash, full_name, student_id, department, role, avatar_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, email, full_name, role
  `, [
    email,
    passwordHash,
    fullName,
    studentId,
    department,
    role,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  ]);

  console.log('Admin user provisioned in RDS:', res.rows[0]);
  await pool.end();
}

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  process.exit(1);
});

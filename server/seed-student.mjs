import pg from 'pg';
import bcrypt from 'bcrypt';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:CampusFind2026SecurePass@campusfind-db.cr88kq62a0lq.ap-south-1.rds.amazonaws.com:5432/campusfind',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const hash = await bcrypt.hash('Student123!', 10);
  const res = await pool.query(
    "INSERT INTO users (email, password_hash, full_name, student_id, department, role) " +
    "VALUES ('rahul.patil@somaiya.edu', $1, 'Rahul Patil', '2023-IT-044', 'Information Technology', 'student') " +
    "ON CONFLICT (email) DO UPDATE SET password_hash = $1 " +
    "RETURNING id, email, full_name;",
    [hash]
  );
  console.log('Seeded student:', res.rows[0]);
  await pool.end();
}
run().catch(console.error);

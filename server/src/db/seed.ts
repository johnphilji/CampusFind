import bcrypt from 'bcrypt';
import { pool } from './index.js';
import { setupDatabase } from './setup.js';

export async function seedDatabase() {
  console.log('🌱 Seeding database with fictional development records...');
  await setupDatabase();

  const saltRounds = 10;
  const studentPasswordHash = await bcrypt.hash('Student123!', saltRounds);
  const adminPasswordHash = await bcrypt.hash('AdminDesk123!', saltRounds);

  // 1. Seed Users
  const user1Res = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, student_id, department, role, avatar_url, phone_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [
      'alex.m@college.edu',
      studentPasswordHash,
      'Alex Morgan',
      'IEC2023048',
      'Information Technology, 3rd Year',
      'student',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      '+1 (555) 234-8901'
    ]
  );
  const alexId = user1Res.rows[0].id;

  const adminRes = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, student_id, department, role, avatar_url, phone_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [
      'admin.desk@college.edu',
      adminPasswordHash,
      'Dr. Sarah Connor (Admin Desk)',
      'ADM2020001',
      'Student Affairs & Security Ops',
      'admin',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      '+1 (555) 999-0000'
    ]
  );

  // 2. Seed Sample Reports
  const reportRes = await pool.query(
    `INSERT INTO reports (reference_number, title, type, category, location, report_date, description, image_url, status, reporter_id, identifying_question)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (reference_number) DO NOTHING
     RETURNING id`,
    [
      'CF-2026-0891',
      'Samsung Galaxy M31 (Blue)',
      'found',
      'Electronics',
      'Near Sports Pavilion',
      '2026-10-20',
      'Found on the bench near the synthetic court. Dark blue case with small corner sticker.',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      'open',
      alexId,
      'What sticker is on the phone case?'
    ]
  );

  console.log('✅ Seeding completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Notice   = require('./models/Notice');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱  Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Notice.deleteMany({});

  // ── Create warden ──────────────────────────────────────────────────────────
  const warden = await User.create({
    name:     'Mr. S. Mehta',
    email:    'warden@hostelos.com',
    password: 'admin123',
    role:     'warden',
  });
  console.log(`✅  Warden created — email: warden@hostelos.com | password: admin123`);

  // ── Create students ────────────────────────────────────────────────────────
  const students = await User.create([
    {
      name:       'Rahul Sharma',
      email:      'rahul@student.hostelos.com',
      password:   'pass123',
      role:       'student',
      rollNo:     'CS2022001',
      department: 'Computer Science & Engineering',
      batch:      '2022-26',
      roomNumber: '204',
      block:      'A',
      phone:      '+91 98765 00001',
    },
    {
      name:       'Arjun Kulkarni',
      email:      'arjun@student.hostelos.com',
      password:   'pass123',
      role:       'student',
      rollNo:     'CS2022002',
      department: 'Computer Science & Engineering',
      batch:      '2022-26',
      roomNumber: '204',
      block:      'A',
      phone:      '+91 98765 00002',
    },
    {
      name:       'Neha Patil',
      email:      'neha@student.hostelos.com',
      password:   'pass123',
      role:       'student',
      rollNo:     'IT2022015',
      department: 'Information Technology',
      batch:      '2022-26',
      roomNumber: '110',
      block:      'B',
      phone:      '+91 98765 00003',
    },
    {
      name:       'Vivek Rao',
      email:      'vivek@student.hostelos.com',
      password:   'pass123',
      role:       'student',
      rollNo:     'ME2023010',
      department: 'Mechanical Engineering',
      batch:      '2023-27',
      roomNumber: '301',
      block:      'A',
      phone:      '+91 98765 00004',
    },
  ]);
  console.log(`✅  ${students.length} students created`);

  // ── Seed notices ───────────────────────────────────────────────────────────
  await Notice.create([
    {
      postedBy: warden._id,
      title:    'Water supply off tomorrow 9–11 AM',
      body:     'Maintenance work in Block A. Please store water in advance.',
      type:     'urgent',
    },
    {
      postedBy: warden._id,
      title:    'Fee due date: 20 March',
      body:     'All students must pay hostel fee before 20 March to avoid a fine.',
      type:     'normal',
    },
    {
      postedBy: warden._id,
      title:    'WiFi upgraded to 200 Mbps',
      body:     'New high-speed WiFi is now active in both blocks. Enjoy faster internet!',
      type:     'info',
    },
  ]);
  console.log('✅  Sample notices created');

  console.log('\n📋  Demo Login Credentials:');
  console.log('   Warden  → warden@hostelos.com  / admin123');
  console.log('   Student → rahul@student.hostelos.com / pass123\n');

  await mongoose.disconnect();
  console.log('✅  Seed complete — MongoDB disconnected');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});

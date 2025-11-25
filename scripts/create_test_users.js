import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../src/models/userModel.js';

config();

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/siga';

async function main(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const users = [
    { email: 'tester_admin@test.local', password: 'Pass1234', role: 'admin', firstName: 'Admin', lastName: 'Tester' },
    { email: 'tester_prof@test.local', password: 'Pass1234', role: 'profesor', firstName: 'Profesor', lastName: 'Tester' }
  ];

  for(const u of users){
    const existing = await User.findOne({ email: u.email });
    if(existing){
      console.log(`User ${u.email} already exists`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const created = new User({ email: u.email, password: hashed, role: u.role, firstName: u.firstName, lastName: u.lastName });
    await created.save();
    console.log(`Created user ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err=>{ console.error(err); process.exit(1); });

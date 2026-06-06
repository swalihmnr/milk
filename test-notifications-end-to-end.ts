import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'server/.env') });

import User from './server/src/models/User';
import Role from './server/src/models/Role';
import UserRole from './server/src/models/UserRole';
import DeliveryJob from './server/src/models/DeliveryJob';
import { approveJobRequest } from './server/src/modules/jobs/jobs.controller';
import Notification from './server/src/models/Notification';

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dairyos');
  
  // Create mock customer role
  let customerRole = await Role.findOne({ name: 'customer' });
  if (!customerRole) customerRole = await Role.create({ name: 'customer', permissions: [] });

  // Create mock customer user
  let customerUser = await User.findOne({ phone: '9999999999' });
  if (!customerUser) customerUser = await User.create({ name: 'Test Customer', phone: '9999999999', passwordHash: 'hash', status: 'active' });
  
  // Assign role
  await UserRole.findOneAndUpdate({ userId: customerUser._id, roleId: customerRole._id }, {}, { upsert: true });

  // Create mock farmer
  let farmerUser = await User.findOne({ phone: '8888888888' });
  if (!farmerUser) farmerUser = await User.create({ name: 'Test Farmer', phone: '8888888888', passwordHash: 'hash', status: 'active' });

  // Create mock job
  const job = await DeliveryJob.create({
    farmerId: farmerUser._id,
    title: 'Test Job',
    description: 'Test Description',
    status: 'pending',
    expiresAt: new Date(Date.now() + 86400000)
  });

  // Mock Request and Response
  const req: any = { params: { id: job._id } };
  const res: any = {
    status: (code: number) => res,
    json: (data: any) => { console.log('Response:', data); }
  };
  const next = (err: any) => console.error('Error:', err);

  // Run the logic
  await approveJobRequest(req, res, next);

  // Check notifications
  const notifs = await Notification.find({ userId: customerUser._id });
  console.log('Notifications generated for customer:', notifs.length);
  if (notifs.length > 0) {
    console.log('Notification Content:', notifs[0].message);
  } else {
    console.log('FAILED: No notification generated');
  }

  // Cleanup
  await DeliveryJob.findByIdAndDelete(job._id);
  await Notification.deleteMany({ userId: customerUser._id });

  process.exit(0);
}

runTest().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'server/.env') });

import User from './server/src/models/User';
import Role from './server/src/models/Role';
import UserRole from './server/src/models/UserRole';
import Notification from './server/src/models/Notification';
import DeliveryJob from './server/src/models/DeliveryJob';

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dairyos');
  console.log('Connected to DB');

  // 1. Find a customer
  const customerRole = await Role.findOne({ name: 'customer' });
  if (!customerRole) {
    console.log('Customer role not found');
    process.exit(1);
  }

  const userRoles = await UserRole.find({ roleId: customerRole._id });
  const targetUserIds = userRoles.map(ur => ur.userId);
  console.log(`Found ${targetUserIds.length} customer users`);

  // 2. Find a farmer
  const farmerRole = await Role.findOne({ name: 'farmer' });
  const farmerUserRoles = await UserRole.find({ roleId: farmerRole?._id });
  const farmerId = farmerUserRoles[0]?.userId;
  
  if (!farmerId) {
    console.log('No farmer found');
    process.exit(1);
  }
  console.log('Using farmer:', farmerId);

  // 3. Simulate the notification logic
  const nearbyUsers = await User.find({ 
    _id: { $in: targetUserIds, $ne: farmerId } 
  });
  console.log(`Found ${nearbyUsers.length} nearby customers to notify`);

  const notifications = nearbyUsers.map(u => ({
    userId: u._id,
    title: 'Test Notification',
    message: 'This is a test notification for the customer.',
    type: 'info'
  }));

  if (notifications.length > 0) {
    const inserted = await Notification.insertMany(notifications);
    console.log(`Successfully inserted ${inserted.length} notifications`);
    
    // cleanup test notifications
    await Notification.deleteMany({ _id: { $in: inserted.map(i => i._id) } });
    console.log('Cleaned up test notifications');
  }

  process.exit(0);
}

runTest().catch(console.error);

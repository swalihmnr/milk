import mongoose from 'mongoose';
import User from '../models/User';
import Role from '../models/Role';
import UserRole from '../models/UserRole';
import Vendor from '../models/Vendor';
import DeliveryBoy from '../models/DeliveryBoy';
import Customer from '../models/Customer';
import Cow from '../models/Cow';
import MilkProduction from '../models/MilkProduction';
import Route from '../models/Route';
import Subscription from '../models/Subscription';
import Product from '../models/Product';
import Category from '../models/Category';
import Wallet from '../models/Wallet';
import Complaint from '../models/Complaint';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';
import Delivery from '../models/Delivery';
import { hashPassword } from './hash';

export const seedDatabase = async () => {
  try {
    console.log('Starting Database Seeding...');

    // Clear all existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await UserRole.deleteMany({});
    await Vendor.deleteMany({});
    await DeliveryBoy.deleteMany({});
    await Customer.deleteMany({});
    await Cow.deleteMany({});
    await MilkProduction.deleteMany({});
    await Route.deleteMany({});
    await Subscription.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Wallet.deleteMany({});
    await Complaint.deleteMany({});
    await Payment.deleteMany({});
    await Invoice.deleteMany({});

    console.log('All existing collections cleared.');

    // 1. Create Roles
    const adminRole = await Role.create({
      name: 'admin',
      description: 'System Administrator',
      permissions: ['all']
    });

    const farmerRole = await Role.create({
      name: 'farmer',
      description: 'Dairy Farmer / Vendor',
      permissions: ['manage_herd', 'manage_customers', 'manage_deliveries']
    });

    const customerRole = await Role.create({
      name: 'customer',
      description: 'MilkFlow App Customer',
      permissions: ['browse_marketplace', 'manage_subscriptions', 'wallet_access']
    });

    const deliveryRole = await Role.create({
      name: 'delivery_boy',
      description: 'Delivery Agent',
      permissions: ['view_assigned_route', 'confirm_delivery']
    });

    console.log('Roles created.');

    const defaultPassHash = await hashPassword('password123');

    // 2. Create Admin User
    const adminUser = await User.create({
      name: 'Super Admin',
      phone: '9999999999',
      email: 'admin@dairyos.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true
    });
    await UserRole.create({ userId: adminUser._id, roleId: adminRole._id });

    // 3. Create Farmer User and Vendor profile
    const farmerUser = await User.create({
      name: 'Ramesh Patil',
      phone: '8888888888',
      email: 'ramesh@greenmeadows.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true,
      isEmailVerified: true,
      farmName: 'Green Meadows Dairy',
      addressLine: 'Gate No. 12, Sinhagad Road',
      village: 'Donje',
      city: 'Pune',
      state: 'Maharashtra',
      herdSize: 25,
      lat: 18.5204,
      lon: 73.8567
    });
    await UserRole.create({ userId: farmerUser._id, roleId: farmerRole._id });

    const vendor = await Vendor.create({
      userId: farmerUser._id,
      companyName: 'Green Meadows Dairy Farm',
      gstNumber: '27AAAAA1111A1Z1',
      approvalStatus: 'approved',
      commissionRate: 8,
      totalRevenue: 24000
    });

    // 4. Create Delivery Boy User and DeliveryBoy profile
    const dboyUser = await User.create({
      name: 'Suresh Kumar',
      phone: '7777777777',
      email: 'suresh@delivery.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true
    });
    await UserRole.create({ userId: dboyUser._id, roleId: deliveryRole._id });

    const deliveryBoy = await DeliveryBoy.create({
      userId: dboyUser._id,
      vendorId: farmerUser._id,
      vehicleType: 'Motorcycle',
      licenseNumber: 'MH-12-DB-2023-009',
      isActive: true,
      isVerified: true,
      currentLat: 18.5210,
      currentLon: 73.8570,
      totalDeliveries: 45,
      rating: 4.8
    });

    // 5. Create Customer Users and Customer profiles
    const customer1User = await User.create({
      name: 'Aditya Shinde',
      phone: '6666666666',
      email: 'aditya@gmail.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true,
      lat: 18.5284,
      lon: 73.8737
    });
    await UserRole.create({ userId: customer1User._id, roleId: customerRole._id });

    const customer1 = await Customer.create({
      farmerId: farmerUser._id,
      name: 'Aditya Shinde',
      phone: '6666666666',
      email: 'aditya@gmail.com',
      address: 'Flat 402, Building A, Green Meadows, Pune, Maharashtra',
      houseName: 'Flat 402',
      street: 'Building A',
      area: 'Green Meadows',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411030',
      status: 'active',
      lat: 18.5284,
      lon: 73.8737
    });

    const customer2User = await User.create({
      name: 'Neha Deshmukh',
      phone: '5555555555',
      email: 'neha@gmail.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true,
      lat: 18.5484,
      lon: 73.8937
    });
    await UserRole.create({ userId: customer2User._id, roleId: customerRole._id });

    const customer2 = await Customer.create({
      farmerId: farmerUser._id,
      name: 'Neha Deshmukh',
      phone: '5555555555',
      email: 'neha@gmail.com',
      address: 'Rowhouse 4, Blue Heaven, Pune, Maharashtra',
      houseName: 'Rowhouse 4',
      street: 'Blue Heaven',
      area: 'Kalyani Nagar',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411006',
      status: 'active',
      lat: 18.5484,
      lon: 73.8937
    });

    const customer3User = await User.create({
      name: 'Vikram Joshi',
      phone: '4444444444',
      email: 'vikram@gmail.com',
      passwordHash: defaultPassHash,
      status: 'active',
      isPhoneVerified: true,
      lat: 18.5004,
      lon: 73.8267
    });
    await UserRole.create({ userId: customer3User._id, roleId: customerRole._id });

    const customer3 = await Customer.create({
      farmerId: farmerUser._id,
      name: 'Vikram Joshi',
      phone: '4444444444',
      email: 'vikram@gmail.com',
      address: 'Flat 12, Shiv Sagar Appts, Kothrud, Pune, Maharashtra',
      houseName: 'Flat 12',
      street: 'Shiv Sagar Appts',
      area: 'Kothrud',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      status: 'active',
      lat: 18.5004,
      lon: 73.8267
    });

    console.log('Users and Profiles created.');

    // 6. Create Categories
    const milkCat = await Category.create({
      name: 'Milk',
      slug: 'milk',
      description: 'Fresh cow & buffalo milk'
    });

    const paneerCat = await Category.create({
      name: 'Paneer & Curd',
      slug: 'paneer-curd',
      description: 'Fresh dairy products'
    });

    console.log('Categories created.');

    // 7. Create Products
    const cowMilkProduct = await Product.create({
      name: 'Fresh A2 Cow Milk',
      description: 'Direct from pastures, pasteurized A2 cow milk',
      categoryId: milkCat._id,
      vendorId: vendor._id,
      price: 65,
      unit: '1 Litre',
      stockQuantity: 120,
      rating: 4.9,
      isPopular: true,
      isActive: true
    });

    const buffaloMilkProduct = await Product.create({
      name: 'Fresh Buffalo Milk',
      description: 'High fat, rich thick buffalo milk',
      categoryId: milkCat._id,
      vendorId: vendor._id,
      price: 80,
      unit: '1 Litre',
      stockQuantity: 80,
      rating: 4.8,
      isPopular: true,
      isActive: true
    });

    const paneerProduct = await Product.create({
      name: 'Fresh Malai Paneer',
      description: 'Soft and fresh cottage cheese',
      categoryId: paneerCat._id,
      vendorId: vendor._id,
      price: 120,
      unit: '200g',
      stockQuantity: 40,
      rating: 4.7,
      isPopular: false,
      isActive: true
    });

    console.log('Products created.');

    // 8. Create Wallets
    await Wallet.create({
      userId: customer1User._id,
      balance: 1000.00,
      transactions: [
        { amount: 1000.00, type: 'credit', description: 'Opening Balance Top Up', date: new Date() }
      ]
    });

    await Wallet.create({
      userId: customer2User._id,
      balance: 50.00,
      transactions: [
        { amount: 50.00, type: 'credit', description: 'Opening Balance Top Up', date: new Date() }
      ]
    });

    await Wallet.create({
      userId: customer3User._id,
      balance: 300.00,
      transactions: [
        { amount: 300.00, type: 'credit', description: 'Opening Balance Top Up', date: new Date() }
      ]
    });

    console.log('Wallets created.');

    // 9. Create Routes
    const mainRoute = await Route.create({
      farmerId: farmerUser._id,
      name: 'Kothrud - Deccan Route',
      area: 'Kothrud/Deccan',
      deliveryBoyId: dboyUser._id,
      status: 'active'
    });

    // Assign routeId to customers
    customer1.routeId = mainRoute._id;
    await customer1.save();
    
    customer3.routeId = mainRoute._id;
    await customer3.save();

    console.log('Routes created and assigned.');

    // 10. Create Subscriptions
    const sub1 = await Subscription.create({
      customerId: customer1._id,
      planName: 'Daily Milk Plan',
      planType: 'daily',
      frequency: 'daily',
      quantity: 1,
      billingCycle: 'prepaid',
      price: 65,
      status: 'active',
      autoRenewal: true,
      vacationMode: false
    });

    const sub2 = await Subscription.create({
      customerId: customer3._id,
      planName: 'Alternate Buffalo Milk Plan',
      planType: 'custom',
      frequency: 'alternate_day',
      quantity: 2,
      billingCycle: 'monthly',
      price: 160,
      status: 'active',
      autoRenewal: true,
      vacationMode: false
    });

    console.log('Subscriptions created.');

    // 11. Create Herd/Cows
    const cow1 = await Cow.create({
      farmerId: farmerUser._id,
      cowCode: 'COW-001',
      breed: 'Gir Cow',
      age: 4,
      purchaseOrBirthDate: new Date('2022-03-15'),
      healthStatus: 'healthy',
      averageMilkOutput: 12.5,
      morningOutput: 7.0,
      eveningOutput: 5.5,
      feedType: 'Green Fodder & Concentrates',
      lastVaccinationDate: new Date('2026-02-10'),
      nextVaccinationDate: new Date('2026-08-10'),
      vetName: 'Dr. Deshpande'
    });

    const cow2 = await Cow.create({
      farmerId: farmerUser._id,
      cowCode: 'COW-002',
      breed: 'Holstein Friesian',
      age: 5,
      purchaseOrBirthDate: new Date('2021-06-20'),
      healthStatus: 'healthy',
      averageMilkOutput: 18.0,
      morningOutput: 10.0,
      eveningOutput: 8.0,
      feedType: 'Silage & High Yield Mix',
      lastVaccinationDate: new Date('2026-01-15'),
      nextVaccinationDate: new Date('2026-07-15'),
      vetName: 'Dr. Deshpande'
    });

    const cow3 = await Cow.create({
      farmerId: farmerUser._id,
      cowCode: 'COW-003',
      breed: 'Jersey',
      age: 3,
      purchaseOrBirthDate: new Date('2023-09-01'),
      healthStatus: 'pregnant',
      pregnancyStatus: '5 months',
      averageMilkOutput: 14.0,
      morningOutput: 8.0,
      eveningOutput: 6.0,
      feedType: 'Maternity Special Feed',
      lastVaccinationDate: new Date('2026-03-01'),
      nextVaccinationDate: new Date('2026-09-01'),
      vetName: 'Dr. Deshpande'
    });

    console.log('Herd/Cows created.');

    // 12. Create Milk Production Logs
    const productionDate = new Date();
    await MilkProduction.create({
      cowId: cow1._id,
      farmerId: farmerUser._id,
      date: productionDate,
      morningLiters: 7.2,
      eveningLiters: 0,
      totalLiters: 7.2,
      fatPercentage: 4.2,
      notes: 'Checked by Ramesh Patil'
    });

    await MilkProduction.create({
      cowId: cow2._id,
      farmerId: farmerUser._id,
      date: productionDate,
      morningLiters: 9.8,
      eveningLiters: 0,
      totalLiters: 9.8,
      fatPercentage: 3.8,
      notes: 'Checked by Ramesh Patil'
    });

    console.log('Milk Production Logs created.');

    // 13. Create support ticket/complaint
    await Complaint.create({
      farmerId: farmerUser._id,
      customerId: customer3._id,
      title: 'Sour Milk Delivered yesterday',
      description: 'The buffalo milk delivered yesterday morning was already split/sour when boiled. Requesting refund for that delivery.',
      status: 'open',
      priority: 'high'
    });

    await Complaint.create({
      farmerId: farmerUser._id,
      customerId: customer1._id,
      title: 'Late delivery by 30 mins',
      description: 'Milk was delivered at 7:30 AM instead of 7:00 AM. Please make it on time.',
      status: 'resolved',
      priority: 'low',
      resolvedAt: new Date()
    });

    console.log('Complaints created.');

    // 14. Create Invoices and payments
    const invoice = await Invoice.create({
      farmerId: farmerUser._id,
      customerId: customer3._id,
      invoiceNumber: 'INV-2026-001',
      billingMonth: '2026-05',
      totalAmount: 1800.00,
      paidAmount: 0,
      pendingAmount: 1800.00,
      dueDate: new Date('2026-06-10'),
      status: 'unpaid'
    });

    console.log('Invoice created.');

    for (let i = 0; i < 10; i++) {
      await Delivery.create({
        farmerId: farmerUser._id,
        customerId: customer1._id,
        deliveryBoyId: dboyUser._id,
        routeId: mainRoute._id,
        date: new Date(),
        shift: 'morning',
        quantity: 1,
        status: 'pending'
      });
    }

    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

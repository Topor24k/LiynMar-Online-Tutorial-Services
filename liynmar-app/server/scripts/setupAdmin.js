import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Admin details
    const adminEmail = 'kayeencampana@gmail.com';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('📝 Updating existing admin account...');
      
      // Update the existing admin with new fields
      existingAdmin.fullName = 'Kayeen Campaña';
      existingAdmin.contactNumber = '+63 123 456 7890'; // Update with your actual number
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isDeleted = false;
      
      await existingAdmin.save({ validateBeforeSave: false }); // Skip validation for existing record
      
      console.log('✅ Admin account updated successfully!');
      console.log('\n📋 Admin Details:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Full Name:', existingAdmin.fullName);
      console.log('   Contact:', existingAdmin.contactNumber);
      console.log('   Role:', existingAdmin.role);
      console.log('\n🔐 Use your existing password to login');
    } else {
      console.log('❌ Admin account not found. Creating new admin...');
      
      // Create new admin account
      const newAdmin = await User.create({
        email: adminEmail,
        password: 'Admin@123', // Change this password after first login
        fullName: 'Kayeen Campaña',
        contactNumber: '+63 123 456 7890', // Update with your actual number
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ New admin account created successfully!');
      console.log('\n📋 Admin Details:');
      console.log('   Email:', newAdmin.email);
      console.log('   Full Name:', newAdmin.fullName);
      console.log('   Contact:', newAdmin.contactNumber);
      console.log('   Role:', newAdmin.role);
      console.log('\n🔐 Default Password: Admin@123');
      console.log('   ⚠️ Please change this password after first login!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();

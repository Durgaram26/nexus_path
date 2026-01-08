const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.faculty.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.faculty.create({
      data: {
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        gender: 'OTHER',
        phoneNumber: '+1234567890',
        departmentId: 1, // Assuming department 1 exists
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // If department doesn't exist, create it first
    if (error.code === 'P2003') {
      console.log('🔧 Creating department first...');
      
      try {
        // Create a default department
        const department = await prisma.department.create({
          data: {
            name: 'Administration',
            description: 'System administration department',
            code: 'ADMIN'
          }
        });

        console.log('✅ Department created:', department.name);

        // Now create the admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.faculty.create({
          data: {
            name: 'System Administrator',
            email: 'admin@example.com',
            password: hashedPassword,
            gender: 'OTHER',
            phoneNumber: '+1234567890',
            departmentId: department.id,
            role: 'ADMIN',
            isActive: true
          }
        });

        console.log('✅ Admin user created successfully:');
        console.log(`   Email: admin@example.com`);
        console.log(`   Password: admin123`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Name: ${admin.name}`);

      } catch (secondError) {
        console.error('❌ Error creating admin user after department creation:', secondError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();



const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Check if we already have data
    const existingFaculty = await prisma.faculty.findFirst();
    if (existingFaculty) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    // Create a college
    const college = await prisma.college.create({
      data: {
        name: 'University of Technology'
      }
    });

    // Create a department
    const department = await prisma.department.create({
      data: {
        name: 'Computer Science',
        description: 'Computer Science Department',
        collegeId: college.id
      }
    });

    // Create a faculty member
    const faculty = await prisma.faculty.create({
      data: {
        email: 'faculty@university.edu',
        name: 'Dr. Sarah Johnson',
        gender: 'FEMALE',
        departmentId: department.id
      }
    });

    // Create a student
    const student = await prisma.student.create({
      data: {
        email: 'student@university.edu',
        name: 'John Doe',
        gender: 'MALE',
        departmentId: department.id,
        year: 1,
        registerNumber: 'STU001',
        favoriteLanguage: 'JavaScript'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created: College (${college.id}), Department (${department.id}), Faculty (${faculty.id}), Student (${student.id})`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();

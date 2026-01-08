const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleCertificateSubmission() {
  try {
    console.log('🔍 Creating sample certificate submission...');
    
    // Get the first student
    const student = await prisma.student.findFirst({
      include: {
        department: true
      }
    });
    
    if (!student) {
      console.log('❌ No students found in database');
      return;
    }
    
    console.log(`👨‍🎓 Found student: ${student.name} (${student.email})`);
    
    // Create a sample certificate submission
    const certificateSubmission = await prisma.certificateSubmission.create({
      data: {
        studentId: student.id,
        courseName: 'Python Programming Fundamentals',
        courseProvider: 'Coursera',
        completionDate: new Date('2024-01-15'),
        certificateFile: 'python-fundamentals-certificate.pdf',
        description: 'Completed comprehensive Python programming course covering data structures, algorithms, and object-oriented programming.',
        courseLink: 'https://www.coursera.org/learn/python-programming',
        courseType: 'online',
        status: 'pending'
      }
    });
    
    console.log('✅ Sample certificate submission created:', certificateSubmission.id);
    console.log('📋 Submission details:');
    console.log(`   Course: ${certificateSubmission.courseName}`);
    console.log(`   Provider: ${certificateSubmission.courseProvider}`);
    console.log(`   Student: ${student.name}`);
    console.log(`   Status: ${certificateSubmission.status}`);
    
    // Create another sample submission
    const certificateSubmission2 = await prisma.certificateSubmission.create({
      data: {
        studentId: student.id,
        courseName: 'JavaScript Web Development',
        courseProvider: 'Udemy',
        completionDate: new Date('2024-02-20'),
        certificateFile: 'javascript-web-dev-certificate.pdf',
        description: 'Mastered JavaScript, HTML, CSS, and React for full-stack web development.',
        courseLink: 'https://www.udemy.com/course/javascript-web-development',
        courseType: 'online',
        status: 'pending'
      }
    });
    
    console.log('✅ Second sample certificate submission created:', certificateSubmission2.id);
    
    // Check total submissions now
    const totalSubmissions = await prisma.certificateSubmission.count();
    console.log(`📊 Total certificate submissions now: ${totalSubmissions}`);
    
  } catch (error) {
    console.error('❌ Error creating sample certificate submission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCertificateSubmission();

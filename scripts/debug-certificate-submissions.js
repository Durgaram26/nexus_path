const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCertificateSubmissions() {
  try {
    console.log('🔍 Checking certificate submissions in database...');
    
    // Check total certificate submissions
    const totalSubmissions = await prisma.certificateSubmission.count();
    console.log(`📊 Total certificate submissions: ${totalSubmissions}`);
    
    if (totalSubmissions === 0) {
      console.log('❌ No certificate submissions found in database');
      console.log('💡 This could be why faculty are not receiving certificates for evaluation');
      return;
    }
    
    // Get all submissions with student info
    const submissions = await prisma.certificateSubmission.findMany({
      include: {
        student: {
          include: {
            department: true,
            careerPaths: {
              include: {
                careerPath: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });
    
    console.log(`\n📋 Certificate Submissions (${submissions.length}):`);
    submissions.forEach((submission, index) => {
      console.log(`\n${index + 1}. ${submission.courseName} by ${submission.student.name}`);
      console.log(`   Student ID: ${submission.studentId}`);
      console.log(`   Department: ${submission.student.department.name}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Submitted: ${submission.submittedAt}`);
      console.log(`   Course Provider: ${submission.courseProvider}`);
    });
    
    // Check students table
    const totalStudents = await prisma.student.count();
    console.log(`\n👥 Total students: ${totalStudents}`);
    
    // Check if there are any students with certificate submissions
    const studentsWithSubmissions = await prisma.student.findMany({
      where: {
        certificateSubmissions: {
          some: {}
        }
      },
      include: {
        certificateSubmissions: true
      }
    });
    
    console.log(`📝 Students with certificate submissions: ${studentsWithSubmissions.length}`);
    
    if (studentsWithSubmissions.length > 0) {
      console.log('\n👨‍🎓 Students with submissions:');
      studentsWithSubmissions.forEach(student => {
        console.log(`- ${student.name} (${student.email}): ${student.certificateSubmissions.length} submissions`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking certificate submissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCertificateSubmissions();

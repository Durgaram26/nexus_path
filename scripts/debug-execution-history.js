const { PrismaClient } = require('@prisma/client');

async function debugExecutionHistory() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging execution history...');
    
    // Check if there are any execution history records
    const allHistory = await prisma.codeExecutionHistory.findMany({
      orderBy: { executedAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 Total execution history records: ${allHistory.length}`);
    
    if (allHistory.length > 0) {
      console.log('📝 Recent execution history:');
      allHistory.forEach((record, index) => {
        console.log(`${index + 1}. Student ID: ${record.studentId}, Language: ${record.language}, Status: ${record.status}, Date: ${record.executedAt}`);
      });
    } else {
      console.log('❌ No execution history found in database');
    }
    
    // Check students table
    const students = await prisma.student.findMany({
      select: { id: true, name: true, email: true }
    });
    
    console.log(`👥 Total students: ${students.length}`);
    if (students.length > 0) {
      console.log('👤 Students in database:');
      students.forEach(student => {
        console.log(`  - ID: ${student.id}, Name: ${student.name}, Email: ${student.email}`);
      });
    }
    
    // Check if there are any code execution records (alternative table)
    const codeExecutions = await prisma.codeExecution.findMany({
      orderBy: { executedAt: 'desc' },
      take: 10
    });
    
    console.log(`💻 Total code execution records: ${codeExecutions.length}`);
    
    if (codeExecutions.length > 0) {
      console.log('📝 Recent code executions:');
      codeExecutions.forEach((record, index) => {
        console.log(`${index + 1}. Student ID: ${record.studentId}, Language: ${record.language}, Status: ${record.status}, Date: ${record.executedAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging execution history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugExecutionHistory();

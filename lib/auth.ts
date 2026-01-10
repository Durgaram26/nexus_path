import { User } from '@prisma/client';
import prisma from './prisma';
import { signToken, verifyToken } from './jwt';

export { signToken, verifyToken };

export const ensureFacultyRecord = async (email: string, userId: number) => {
  try {
    // Check if Faculty record exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { email }
    });

    if (existingFaculty) {
      return existingFaculty;
    }

    // Get user details to create Faculty record
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      include: { department: true }
    });

    if (!user || !user.departmentId) {
      throw new Error('User or department not found');
    }

    // Create a basic Faculty record
    const faculty = await prisma.faculty.create({
      data: {
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        gender: 'OTHER', // Default gender
        departmentId: user.departmentId,
        canAssignCrossDepartment: false,
        assignedYears: null
      }
    });

    console.log(`Created Faculty record for ${email}`);
    return faculty;
  } catch (error) {
    console.error('Error ensuring Faculty record:', error);
    throw error;
  }
};
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const signToken = (user: User) => {
  const access_token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return access_token;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { userId: number; role: string; email: string };
  } catch (error) {
    return null;
  }
};

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
      where: { id: userId },
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
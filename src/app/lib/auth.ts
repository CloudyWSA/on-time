import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function createToken(payload: JWTPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      workSchedule: {
        create: {
          entryTime: '09:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
          exitTime: '18:00',
        },
      },
    },
    include: {
      workSchedule: true,
    },
  });

  return { ...user, password: undefined };
}

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      workSchedule: true,
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return { ...user, password: undefined };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      workSchedule: true,
    },
  });

  if (!user) {
    return null;
  }

  return { ...user, password: undefined };
}

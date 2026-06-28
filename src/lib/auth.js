import jwt from 'jsonwebtoken';
import { prisma } from './db';

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
}

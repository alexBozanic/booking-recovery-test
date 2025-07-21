import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define the User type directly in this file
// This removes the need for the non-existent '@/types' import
interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-long';

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Verify a password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate a JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify a JWT token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as User;
  } catch (error) {
    return null;
  }
}

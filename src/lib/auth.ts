import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define the shape of the token payload
interface TokenPayload {
  id: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-for-local-dev';

// --- Password Hashing ---

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// --- JSON Web Tokens (JWT) ---

export function generateToken(user: { id: string; email: string }): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token will be valid for 7 days
  });

  return token;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // This will catch errors for expired or invalid tokens
    console.error('JWT Verification Error:', error);
    return null;
  }
}

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production-min-32-chars";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  // @ts-ignore - jsonwebtoken types are not matching correctly
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export const JWT_SECRET_VALUE = JWT_SECRET;
export const JWT_EXPIRES_IN_VALUE = JWT_EXPIRES_IN;

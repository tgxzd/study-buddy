import { prisma } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken, type TokenPayload } from "../config/jwt.js";
import type { LoginInput } from "../utils/validation.js";

// User response type
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Register input without confirmPassword (for service layer)
export interface ServiceRegisterInput {
  name: string;
  email: string;
  password: string;
}

function toUserResponse(user: any): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: ServiceRegisterInput): Promise<{ user: UserResponse; token: string }> {
  const { name, email, password } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  // Generate token
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user: toUserResponse(user),
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<{ user: UserResponse; token: string }> {
  const { email, password } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    user: toUserResponse(user),
    token,
  };
}

export async function getUserById(userId: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return toUserResponse(user);
}

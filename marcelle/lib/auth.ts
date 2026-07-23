import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-change-this-in-production";

export interface TokenPayload {
  id: string;
  email: string;
  role: "admin" | "family";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (error) {
    return null;
  }
}

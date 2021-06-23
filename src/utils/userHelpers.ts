import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient, User } from "@prisma/client";
import moment from "moment";
import { Request } from "express";

import { BaseUserPayload } from "./interfaces";

export async function getUser(request: Request, prisma: PrismaClient) {
  // Define token from Authorization header
  let token: string | undefined;
  if (request.headers.authorization && request.headers.authorization.startsWith("JWT")) {
    token = request.headers.authorization.split(" ")[1];
  }

  // Check whether token was sent in header according to requirements
  if (!token) {
    throw new Error("Login is required before accessing the resource!");
  }

  // Verify token and get payload
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token!");
  }

  // Get user from id and check whether user exists
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    throw new Error("User does no longer exists!");
  }

  // Check whether password was changed after token was issued
  if (passwordChangedAfter(payload.iat, user.passwordChangeDate)) {
    throw new Error("Password was changed recently. Please login again!");
  }

  return user;
}

export function jwtSign(payload: { [key: string]: any }): string {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRE_TIME as string,
  });
}

export async function checkPassword(candidatePassword: string, userPassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, userPassword);
}

export function deletePassword<T extends { password: string }>(userWithPassword: T): Omit<T, "password"> {
  return { ...userWithPassword, password: undefined };
}

export function getBaseUserPayload(user: User): BaseUserPayload {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo,
  };
}

export function createHashedResetToken() {
  const resetToken: string = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  return { resetToken, hashedResetToken };
}

export function passwordChangedAfter(JWTTimestamp: number, passwordChangeDate: Date | null) {
  if (passwordChangeDate) {
    return moment.unix(JWTTimestamp).isBefore(moment(passwordChangeDate));
  }

  return false;
}

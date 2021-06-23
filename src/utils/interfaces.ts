import { PrismaClient } from ".prisma/client";
import { Request } from "express";
import { Difficulty } from ".prisma/client";

export interface Context {
  prisma: PrismaClient;
  request: Request;
}

export interface SignupInput {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordBase {
  password: string;
  passwordConfirm: String;
}

export interface ResetPasswordInput extends ChangePasswordBase {
  resetToken: string;
}

export interface ChangePasswordInput extends ChangePasswordBase {
  passwordCurrent: string;
}

export interface UpdateMeInput {
  name?: string;
  email?: string;
  photo?: string;
}

export interface BaseUserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  photo: string;
}

export interface CreateTourInput {
  name: string;
  price: number;
  priceDiscount?: number;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  summary: string;
  description: string;
  startLocation: StartLocationInput;
  locations: LocationInput[];
  startDates: Date[];
  secret?: boolean;
  imageCover?: string;
  images?: string[];
  guides: string[];
}

export type StartLocationInput = {
  type: string;
  coordinates: [number, number];
  address: string;
  description: string;
};

export type LocationInput = {
  type: string;
  coordinates: [number, number];
  description: string;
  day: number;
};

export interface CreateReviewInput {
  review: string;
  rating: number;
  tourId: string;
  userId: string;
}

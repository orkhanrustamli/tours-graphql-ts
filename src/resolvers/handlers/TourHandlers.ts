import { prisma, Prisma } from "@prisma/client";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import moment from "moment";
import slugify from "slugify";

import { Context } from "../../utils/interfaces";
import CustomError from "../../utils/CustomError";
import { CreateTourInput } from "../../utils/interfaces";

export async function getAllTours(parent, args, ctx: Context, info) {
  const { prisma } = ctx;

  const tours = await prisma.tour.findMany();

  return tours;
}

export async function getTour(parent, { id }: { id: string }, ctx: Context, info) {
  const { prisma } = ctx;

  const tour = prisma.tour.findUnique({ where: { id } });

  if (!tour) {
    throw new Error("There is no tour with this id!");
  }

  return tour;
}

export async function createTour(parent, { data }: { data: CreateTourInput }, ctx: Context, info) {
  const { prisma } = ctx;

  try {
    const tour = await prisma.tour.create({
      data: {
        ...data,
        slug: slugify(data.name, { lower: true }),
        guides: {
          connect: data.guides.map((g) => {
            return { id: g };
          }),
        },
      },
    });

    return tour;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("Tour with this name already exists!");
      } else {
        throw error;
      }
    }
  }
}

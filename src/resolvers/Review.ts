import { PrismaClient } from "@prisma/client";
import { Context } from "../utils/interfaces";
import User from "./User";

const Review = {
  async user(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const user = await prisma.review.findUnique({ where: { id: parent.id } }).user();

    return user;
  },
  async tour(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const tour = await prisma.review.findUnique({ where: { id: parent.id } }).tour();

    return tour;
  },
};

export default Review;

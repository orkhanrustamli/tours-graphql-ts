import { PrismaClient } from "@prisma/client";
import { Context } from "../utils/interfaces";

const User = {
  async reviews(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const reviews = await prisma.user.findUnique({ where: { id: parent.id } }).reviews();

    return reviews;
  },
  async guidedTours(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const guidedTours = await prisma.user.findUnique({ where: { id: parent.id } }).guidedTours();

    return guidedTours;
  },
};

export default User;

import { PrismaClient } from ".prisma/client";
import { Context } from "../utils/interfaces";

const Tour = {
  async guides(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const guides = await prisma.tour.findUnique({ where: { id: parent.id } }).guides();

    return guides;
  },
  async reviews(parent, args, ctx: Context, info) {
    const { prisma } = ctx;

    const reviews = await prisma.tour.findUnique({ where: { id: parent.id } }).reviews();

    return reviews;
  },
};

export default Tour;

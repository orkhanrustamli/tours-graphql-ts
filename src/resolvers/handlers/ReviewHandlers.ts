import { Prisma } from "@prisma/client";
import validator from "validator";
import moment from "moment";
import slugify from "slugify";

import { Context } from "../../utils/interfaces";
import CustomError from "../../utils/CustomError";
import { getUser } from "../../utils/userHelpers";
import { CreateReviewInput } from "../../utils/interfaces";

export async function createReview(parent, { data }: { data: CreateReviewInput }, ctx: Context, info) {
  const { request, prisma } = ctx;

  //   await getUser(request, prisma);

  if (![1, 2, 3, 4, 5].includes(data.rating)) {
    throw new Error("Rating must be a integer value between 1 and 5!");
  }

  try {
    const review = await prisma.review.create({ data });

    return review;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("You have already reviewed this tour!");
      } else {
        error;
      }
    }
  }
}

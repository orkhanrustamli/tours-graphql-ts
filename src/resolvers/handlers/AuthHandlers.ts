import { Prisma } from "@prisma/client";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import moment from "moment";

import { SignupInput, LoginInput, ResetPasswordInput, ChangePasswordInput, UpdateMeInput, Context } from "../../utils/interfaces";
import { getUser, jwtSign, checkPassword, deletePassword, createHashedResetToken, getBaseUserPayload } from "../../utils/userHelpers";
import sendMail from "../../utils/sendMail";
import CustomError from "../../utils/CustomError";

// MUTATIONS
export async function signup(parent, { data }: { data: SignupInput }, ctx: Context, info) {
  let { name, email, photo, password, passwordConfirm } = data;
  const { prisma } = ctx;
  email = email.toLowerCase();

  if (password !== passwordConfirm) {
    throw new Error("Password and Confirm Password must match!");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Please provide correct email address!");
  }

  password = await bcrypt.hash(password, 12);

  try {
    let newUser = await prisma.user.create({ data: { name, email, photo, password } });

    const token: string = jwtSign({ id: newUser.id });

    return { token, user: newUser };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("User with this email address already exists!");
      } else {
        throw new Error("Something is wrong. Please try again later!");
      }
    }
  }
}

export async function login(parent, { data }: { data: LoginInput }, ctx: Context, info) {
  let { email, password } = data;
  let { prisma } = ctx;

  let user = await prisma.user.findFirst({ where: { email: email.toLowerCase(), active: true } });

  if (!user || !(await checkPassword(password, user.password))) {
    throw new CustomError("Email or Password is incorrect");
  }

  const token: string = jwtSign({ id: user.id });

  return {
    token,
    user,
  };
}

export async function forgotPassword(parent, { email }: { email: string }, ctx: Context, info) {
  const { prisma } = ctx;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new CustomError("There is no user with this email address!");
  }

  const { resetToken, hashedResetToken } = createHashedResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpires: new Date(moment().add(10, "m").format()),
    },
  });

  const resetURL: string = `http://localhost:4000/auth/reset-password/${resetToken}`;
  const message = `Please click on: ${resetURL} to reset your password`;

  try {
    await sendMail({
      reciever: user.email,
      subject: "Password Reset (valid for 10 mins)",
      message: message,
    });

    return true;
  } catch (error) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      },
    });

    throw new Error("The was an error while sending the mail. Try again later!");
  }
}

export async function resetPassword(parent, { data }: { data: ResetPasswordInput }, ctx: Context, info) {
  let { resetToken, password, passwordConfirm } = data;
  const { prisma } = ctx;

  if (password !== passwordConfirm) {
    throw new Error("Password and Confirm Password must match!");
  }

  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpires: {
        gt: moment().format(),
      },
    },
  });

  if (!user) {
    throw new Error("Token is invalid or has expired");
  }

  password = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });

  return true;
}

export async function changePassword(parent, { data }: { data: ChangePasswordInput }, ctx: Context, info) {
  let { passwordCurrent, password, passwordConfirm } = data;
  const { prisma, request } = ctx;

  const user = await getUser(request, prisma);

  if (!(await checkPassword(passwordCurrent, user.password))) {
    throw new Error("Current password is incorrect!");
  }

  if (password !== passwordConfirm) {
    throw new Error("Password and Confirm Password must match!");
  }

  password = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordChangeDate: new Date(),
    },
  });

  return true;
}

export async function updateMe(parent, { data }: { data: UpdateMeInput }, ctx: Context, info) {
  const { prisma, request } = ctx;

  let user = await getUser(request, prisma);

  user = await prisma.user.update({ where: { id: user.id }, data });

  return getBaseUserPayload(user);
}

export async function deleteUser(parent, { id }: { id: string }, ctx: Context, info) {
  const { prisma, request } = ctx;

  let user = await getUser(request, prisma);
  if (user.role !== "admin") {
    throw new Error("You do not have priviligies to perform this action!");
  }

  await prisma.user.delete({ where: { id } });

  return true;
}

// QUERIES
export async function getMe(parent, args, ctx: Context, info) {
  const { prisma, request } = ctx;

  let user = await getUser(request, prisma);

  return user;
}

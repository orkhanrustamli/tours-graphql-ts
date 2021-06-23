import { GraphQLServer } from "graphql-yoga";
import { PrismaClient } from ".prisma/client";
import dotenv from "dotenv";

import * as Resolvers from "./resolvers/index";

dotenv.config({ path: `${__dirname}/../config.env` });

const prisma = new PrismaClient();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers: {
    ...Resolvers,
  },
  context(req) {
    return { prisma, request: req.request };
  },
});

server.start(() => {
  console.log("Listening on port 4000");
});

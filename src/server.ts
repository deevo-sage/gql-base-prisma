require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./typeDefs";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";

export const prisma = new PrismaClient();

async function startApolloServer() {
  let schema = makeExecutableSchema({ typeDefs, resolvers: {} });
  const PORT = process.env.PORT || 8000;
  const app = express();
  app.use(cors());
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    mocks: true,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    formatError: (err) => {
      console.error("Error!!");
      console.error(err.message);
      if ((err.extensions as any).custom) {
        return err;
      }
      return new Error("Internal Server Error");
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  httpServer.listen({ port: PORT });
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
}
startApolloServer();

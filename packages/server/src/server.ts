import Fastify, { FastifyError } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import helmet from "@fastify/helmet";
import rate_limit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import { agentRouter } from "./routes/agent";

const fastify = Fastify({
  logger: true,
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
fastify.register(helmet);
fastify.register(rate_limit, {
  max: 100,
  timeWindow: "1 minute",
});
fastify.register(cors);

export const server = fastify.withTypeProvider<ZodTypeProvider>();

export type Api = typeof server;

server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (req, body, done) {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      const error = err as FastifyError;
      error.statusCode = 400;
      done(error, undefined);
    }
  }
);

server.register((api: Api, opts, done) => {
  agentRouter(api);
  done();
});

const start = async () => {
  try {
    const address = server.server.address();
    const addressPort = typeof address === "string" ? address : address?.port;
    const port = Number(addressPort) || 3000;
    await server.listen({ port });
    console.log("Listening on port:", port);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

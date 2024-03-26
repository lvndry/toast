import Fastify, { FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import helmet from "@fastify/helmet";
import rate_limit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import z from "zod";

const fastify: FastifyInstance = Fastify({});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
fastify.register(helmet);
fastify.register(rate_limit, {
  max: 100,
  timeWindow: "1 minute",
});
fastify.register(cors);

const server = fastify.withTypeProvider<ZodTypeProvider>();

server.post(
  "/get-tos-url",
  { schema: { body: z.object({ website: z.string() }) } },
  (req, reply) => {
    return { data: req.body.website };
  }
);

const start = async () => {
  try {
    await server.listen({ port: 3000 });

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

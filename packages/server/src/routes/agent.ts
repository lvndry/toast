import { z } from "zod";
import { Api } from "../server";

export const agentRouter = (api: Api) => {
  api.post(
    "/get-tos-url",
    { schema: { body: z.object({ website: z.string() }) } },
    (req, reply) => {
      return { data: req.body.website };
    }
  );
};

import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";

import {createTRPCContext} from "@saasfly/api";
import {edgeRouter} from "@saasfly/api/edge";
import {getAuth} from "@clerk/nextjs/server";

// export const runtime = "edge";
const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
        auth: getAuth(req),
    });
};

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc/edge",
        router: edgeRouter,
        req: req,
        createContext: () => createContext(req),
        onError: ({error, path}) => {
            console.log("Error in tRPC handler (edge) on path", path);
            console.error(error);
        },
    });

export {handler as GET, handler as POST};

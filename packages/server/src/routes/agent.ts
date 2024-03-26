export const agentRoutes: ServerRoute[] = [
  {
    method: "POST",
    path: "/get-tos-url",
    handler: getTOSURL,
    options: {
      validate: {
        payload: getTOSPaylod,
      },
    },
  },
];

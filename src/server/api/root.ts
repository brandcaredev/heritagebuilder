import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { countryRouter } from "./routers/country";
import { buildingTypeRouter } from "./routers/buildingtype";
import { buildingRouter } from "./routers/building";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  country: countryRouter,
  buildingType: buildingTypeRouter,
  building: buildingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

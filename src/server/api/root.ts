import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { countryRouter } from "./routers/country";
import { buildingTypeRouter } from "./routers/buildingtype";
import { buildingRouter } from "./routers/building";
import { cityRouter } from "./routers/city";
import { countyRouter } from "./routers/county";
import { userRouter } from "./routers/user";
import { youtubeRouter } from "./routers/youtube";

export const appRouter = createTRPCRouter({
  country: countryRouter,
  buildingType: buildingTypeRouter,
  building: buildingRouter,
  city: cityRouter,
  county: countyRouter,
  user: userRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

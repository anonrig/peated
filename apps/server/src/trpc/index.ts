import { startSpan, withScope } from "@sentry/node-experimental";
import { TRPCError, initTRPC } from "@trpc/server";
import { type Context } from "./context";

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user?.admin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const isMod = t.middleware(({ ctx, next }) => {
  if (!ctx.user?.mod) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const instrumented = t.middleware(async ({ ctx, next, path, type }) => {
  return await withScope(async (scope) => {
    return await startSpan(
      {
        op: `trpc.${type}`,
        name: path,
      },
      async (span) => {
        span.setAttribute("rpc.method", path);
        span.setAttribute("rpc.system", "trpc");
        // span.setAttribute("server.address", "");

        return await next({ ctx });
      },
    );
  });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(instrumented);
export const authedProcedure = publicProcedure.use(isAuthed);
export const adminProcedure = publicProcedure.use(isAdmin);
export const modProcedure = publicProcedure.use(isMod);

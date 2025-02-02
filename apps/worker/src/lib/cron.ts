import * as Sentry from "@sentry/node-experimental";
import { AsyncTask, CronJob, ToadScheduler } from "toad-scheduler";

export const scheduler = new ToadScheduler();

export function scheduledJob(
  schedule: string,
  name: string,
  cb: () => Promise<void>,
) {
  const task = new AsyncTask(name, async () => {
    const checkInId = Sentry.captureCheckIn(
      {
        monitorSlug: name,
        status: "in_progress",
      },
      {
        schedule: {
          type: "crontab",
          value: schedule,
        },
      },
    );

    return Sentry.withScope(async (scope) => {
      scope.setContext("monitor", {
        slug: name,
      });

      await Sentry.startSpan(
        {
          op: `cron ${name}`,
          name: name,
        },
        async (span) => {
          try {
            const rv = await cb();
            Sentry.captureCheckIn({
              checkInId,
              monitorSlug: name,
              status: "ok",
            });
            span.setStatus({
              code: 1, // OK
            });
            return rv;
          } catch (e) {
            span.setStatus({
              code: 2, // ERROR
            });
            Sentry.captureException(e);
            Sentry.captureCheckIn({
              checkInId,
              monitorSlug: name,
              status: "error",
            });
          }
        },
      );
    });
  });

  const job = new CronJob(
    {
      cronExpression: schedule,
    },
    task,
    {
      preventOverrun: true,
    },
  );

  scheduler.addCronJob(job);

  return task;
}

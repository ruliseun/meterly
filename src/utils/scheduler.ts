import { CronJob } from "cron";
import Logger from "./logger";
import SchedulerService from "../service/scheduler.service";

export const startScheduler = async () => {
  Logger.info("*** Scheduler started ***");

  CronJob.from({
    cronTime: "*/10 * * * *", // Every 10 mins
    onTick: function () {
      SchedulerService.chargeDailyUsage();
      Logger.info("JOB::: Daily usage Job");
    },
    start: true,
    timeZone: "Africa/Lagos",
  });
};

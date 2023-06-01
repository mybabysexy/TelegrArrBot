import {CronJob} from 'cron';
import {willDebug} from "../common/functions";
import GetQueueDetail from "./queue-detail.job";
import {env} from "../common/env";

const initCronJobs = () => {
    const jobs = [
        new GetQueueDetail(env("QUEUE_NOTIFICATION_CRON", "0 */5 * * * *")),
    ];

    jobs.forEach(job => {
        willDebug(`Loading job: ${job.name}`);
        willDebug(`Cron Expr: ${job.cronExpr}`);
        try {
            const cronJob = new CronJob(job.cronExpr, job.handle);
            cronJob.start();
        } catch (err) {
            willDebug(`Error: ${err.message}`);
        }
        willDebug("-------");
    });
};

export default initCronJobs;

const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const judgeService = require("../services/submission/judge.service");


const connection = new IORedis({

    host: "127.0.0.1",
    port: 6379,

    maxRetriesPerRequest: null

});


console.log("[Judge Worker] Starting...");


const judgeWorker = new Worker(

    "judge-queue",

    async (job) => {

        const {
            submissionId
        } = job.data;


        console.log(
            `[Judge Worker] Processing Submission: ${submissionId}`
        );


        await judgeService.judgeSubmission(
            submissionId
        );


        console.log(
            `[Judge Worker] Finished Submission: ${submissionId}`
        );

    },

    {

        connection,

        concurrency: 1

    }

);


judgeWorker.on(
    "completed",
    (job) => {

        console.log(
            `[Judge Worker] Job completed: ${job.id}`
        );

    }
);


judgeWorker.on(
    "failed",
    (job, error) => {

        console.error(
            `[Judge Worker] Job failed: ${job?.id}`,
            error
        );

    }
);


judgeWorker.on(
    "error",
    (error) => {

        console.error(
            "[Judge Worker Error]",
            error
        );

    }
);


console.log(
    "[Judge Worker] Started successfully"
);


module.exports = judgeWorker;


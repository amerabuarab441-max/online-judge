const { Queue } = require("bullmq");
const IORedis = require("ioredis");


const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
});


const judgeQueue = new Queue(
    "judge-queue",
    {
        connection
    }
);


async function enqueue(submissionId) {

    console.log(
        "[QUEUE] Adding submission:",
        submissionId
    );


    const job = await judgeQueue.add(
        "judge-submission",
        {
            submissionId
        },
        {
            attempts: 3,

            backoff: {
                type: "exponential",
                delay: 2000
            },

            removeOnComplete: true,

            removeOnFail: false
        }
    );


    console.log(
        "[QUEUE] Job added:",
        job.id
    );


    return job;
}


module.exports = {
    judgeQueue,
    enqueue
};


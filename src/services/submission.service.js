const prisma = require("../config/prisma");
const executionService = require("./execution.service");

exports.createSubmission = async (userId, data) => {

    const {
        problemId,
        sourceCode,
        language
    } = data;


    const problem = await prisma.problem.findUnique({
        where: {
            id: problemId
        }
    });


    if (!problem) {
        throw new Error("Problem not found");
    }


    const submission = await prisma.submission.create({
        data: {
            sourceCode,
            language,

            userId,
            problemId
        }
    });

    const testCase = await prisma.testCase.findFirst({
    where: {
        problemId,
    },
});

    const result = await executionService.executeCpp(
    submission.id,
    sourceCode,
    testCase.input
);


const status =
    result.trim() === testCase.output.trim()
        ? "ACCEPTED"
        : "WRONG_ANSWER";


await prisma.submission.update({
    where: {
        id: submission.id
    },
    data: {
        status
    }
});


return await prisma.submission.findUnique({
    where: {
        id: submission.id
    }
});

    return submission;
};



exports.getMySubmissions = async (userId) => {

    const submissions = await prisma.submission.findMany({

        where: {
            userId
        },

        include: {
            problem: {
                select: {
                    title: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });


    return submissions;
};



exports.getProblemSubmissions = async (problemId) => {

    const submissions = await prisma.submission.findMany({

        where: {
            problemId
        },

        include: {
            user: {
                select: {
                    username: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });


    return submissions;
};
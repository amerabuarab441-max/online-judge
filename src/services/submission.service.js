const prisma = require("../config/prisma");


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
const prisma = require("../config/prisma");

exports.createProblem = async (data, authorId) => {
    const problem = await prisma.problem.create({
        data: {
            title: data.title,
            description: data.description,
            timeLimit: data.timeLimit,
            memoryLimit: data.memoryLimit,
            difficulty: data.difficulty,
            authorId: authorId
        }
    });

    return problem;
};
exports.getProblems = async () => {

    const problems = await prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            difficulty: true,
            timeLimit: true,
            memoryLimit: true,
            createdAt: true
        }
    });

    return problems;
};



exports.getProblemById = async (id) => {

    const problem = await prisma.problem.findUnique({
        where: {
            id
        },
        include: {
            author: {
                select: {
                    username: true
                }
            }
        }
    });


    if (!problem) {
        throw new Error("Problem not found");
    }


    return problem;
};
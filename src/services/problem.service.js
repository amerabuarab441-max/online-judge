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
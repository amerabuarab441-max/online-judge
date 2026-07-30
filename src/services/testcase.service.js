const prisma = require("../config/prisma");

exports.createTestCase = async (problemId, data) => {

    const { input, output, isHidden } = data;

    const problem = await prisma.problem.findUnique({
        where: {
            id: problemId
        }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    const testCase = await prisma.testCase.create({
        data: {
            input,
            output,
            isHidden,
            problemId
        }
    });

    return testCase;
};


exports.getProblemTestCases = async (problemId) => {

    const testCases = await prisma.testCase.findMany({
        where: {
            problemId
        }
    });

    return testCases;
};


exports.deleteTestCase = async (id) => {

    await prisma.testCase.delete({
        where: {
            id
        }
    });
};
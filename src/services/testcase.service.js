const prisma = require("../config/prisma");

exports.getTestCasesByProblem = async (problemId, user) => {
    // التحقق من وجود المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { id: true, authorId: true }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // الأدمن أو صاحب المشكلة يمكنه رؤية كل الـ test cases
    const isAdmin = user.role === "ADMIN";
    const isProblemSetter = user.role === "PROBLEM_SETTER" && problem.authorId === user.id;

    const testCases = await prisma.testCase.findMany({
        where: { problemId },
        orderBy: { createdAt: "asc" }
    });

    // إذا كان مستخدم عادي، نخفي الـ test cases المخفية
    if (!isAdmin && !isProblemSetter) {
        return testCases
            .filter(tc => !tc.isHidden)
            .map(tc => ({
                id: tc.id,
                problemId: tc.problemId,
                isHidden: false
                // لا نكشف الـ input و الـ output
            }));
    }

    return testCases;
};

exports.createTestCase = async (data) => {
    const { problemId, input, output, isHidden = true } = data;

    // التحقق من البيانات
    if (!problemId) {
        throw new Error("Problem ID is required");
    }

    if (input === undefined || input === null) {
        throw new Error("Input is required");
    }

    if (output === undefined || output === null) {
        throw new Error("Output is required");
    }

    // التحقق من وجود المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id: problemId }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // إنشاء الـ test case
    const testCase = await prisma.testCase.create({
        data: {
            problemId,
            input: input.toString(),
            output: output.toString(),
            isHidden: Boolean(isHidden)
        }
    });

    return testCase;
};

exports.deleteTestCase = async (testCaseId) => {
    const testCase = await prisma.testCase.findUnique({
        where: { id: testCaseId }
    });

    if (!testCase) {
        throw new Error("Test case not found");
    }

    await prisma.testCase.delete({
        where: { id: testCaseId }
    });
};

exports.updateTestCase = async (testCaseId, data) => {
    const testCase = await prisma.testCase.findUnique({
        where: { id: testCaseId }
    });

    if (!testCase) {
        throw new Error("Test case not found");
    }

    const updatedTestCase = await prisma.testCase.update({
        where: { id: testCaseId },
        data: {
            ...(data.input !== undefined && { input: data.input.toString() }),
            ...(data.output !== undefined && { output: data.output.toString() }),
            ...(data.isHidden !== undefined && { isHidden: Boolean(data.isHidden) })
        }
    });

    return updatedTestCase;
};
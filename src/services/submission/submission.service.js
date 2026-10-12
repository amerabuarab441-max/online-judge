const prisma = require("../../config/prisma");
const { enqueue } = require("../../workers/judge.queue");

const SUPPORTED_LANGUAGES = ["cpp", "python"];

exports.createSubmission = async (userId, data) => {
    const {
        problemId,
        sourceCode,
        language,
        contestId
    } = data;

    // التحقق من اللغة
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        throw new Error("Unsupported programming language");
    }

    // التحقق من الكود
    if (!sourceCode || !sourceCode.trim()) {
        throw new Error("Source code is required");
    }

    // التحقق من المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id: problemId }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // إنشاء الـ submission
    const submission = await prisma.submission.create({
        data: {
            sourceCode,
            language,
            userId,
            problemId,
            contestId: contestId || null
        }
    });

    console.log(`[Submission] Created: ${submission.id}`);

    // إضافته للـ Queue
    try {
        await enqueue(submission.id);
        console.log(`[Submission] Added to judge queue: ${submission.id}`);
    } catch (error) {
        console.error(
            `[Submission] Failed to add to judge queue: ${submission.id}`,
            error
        );
        throw new Error("Submission created but could not be added to judge queue");
    }

    return submission;
};

// 🆕 جلب submissions الخاصة بالمستخدم مع Pagination
exports.getMySubmissions = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
            where: { userId },
            include: {
                problem: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.submission.count({
            where: { userId }
        })
    ]);

    return {
        submissions,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// 🆕 جلب submissions لمشكلة معينة مع صلاحيات
exports.getProblemSubmissions = async (
    problemId,
    userId,
    userRole,
    page = 1,
    limit = 20
) => {
    // جلب المشكلة للتأكد من الصلاحيات
    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { authorId: true }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    const isAdmin = userRole === "ADMIN";
    const isProblemSetter = userRole === "PROBLEM_SETTER" && problem.authorId === userId;

    // المستخدم العادي يرى فقط submissions الخاصة به
    let whereClause = { problemId };
    if (!isAdmin && !isProblemSetter) {
        whereClause.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.submission.count({ where: whereClause })
    ]);

    return {
        submissions,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// 🆕 جلب submissionById مع صلاحيات وحماية البيانات الحساسة
exports.getSubmissionById = async (submissionId, userId, userRole) => {
    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    authorId: true
                }
            },
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            results: {
                include: {
                    testCase: {
                        select: {
                            id: true,
                            isHidden: true,
                            input: true,
                            output: true
                        }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!submission) {
        throw new Error("Submission not found");
    }

    // التحقق من الصلاحيات
    const isOwner = submission.userId === userId;
    const isAdmin = userRole === "ADMIN";
    const isProblemSetter =
        userRole === "PROBLEM_SETTER" && submission.problem.authorId === userId;

    if (!isOwner && !isAdmin && !isProblemSetter) {
        throw new Error("You do not have permission to view this submission");
    }

    // حماية البيانات الحساسة للمستخدم العادي
    if (!isAdmin && !isProblemSetter) {
        submission.results = submission.results.map((result) => {
            // إخفاء تفاصيل الـ test cases المخفية
            if (result.testCase.isHidden) {
                return {
                    ...result,
                    testCase: {
                        id: result.testCase.id,
                        isHidden: true
                        // لا نكشف input/output للـ hidden test cases
                    },
                    actualOutput: null, // إخفاء المخرجات للـ hidden test cases
                    errorMessage:
                        result.status === "ACCEPTED" ? null : result.errorMessage
                };
            }
            return result;
        });
    }

    // حذف البيانات الحساسة
    delete submission.problem.authorId;

    return submission;
};
const prisma = require("../config/prisma");
const axios = require("axios");
exports.createProblem = async (data, authorId) => {
   const problem = await prisma.problem.create({
    data: {
        title,
        titleAr: data.titleAr || null,
        description,
        descriptionAr: data.descriptionAr || null,
        difficulty,
        timeLimit,
        memoryLimit,
        authorId
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
exports.updateProblem = async (id, data) => {

    const problem = await prisma.problem.update({
        where: {
            id
        },
        data: {
            title: data.title,
            description: data.description,
            timeLimit: data.timeLimit,
            memoryLimit: data.memoryLimit,
            difficulty: data.difficulty
        }
    });

    return problem;
};

exports.deleteProblem = async (id, userId, userRole) => {
    // التحقق من وجود المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // التحقق من الصلاحيات
    const isAdmin = userRole === "ADMIN";
    const isAuthor = problem.authorId === userId;

    if (!isAdmin && !isAuthor) {
        throw new Error("You do not have permission to delete this problem");
    }

    // حذف كل البيانات المرتبطة قبل حذف المشكلة
    // 1. حذف SubmissionResults المرتبطة بـ test cases هذه المشكلة
    await prisma.submissionResult.deleteMany({
        where: {
            testCase: {
                problemId: id
            }
        }
    });

    // 2. حذف Submissions المرتبطة بالمشكلة
    await prisma.submission.deleteMany({
        where: { problemId: id }
    });

    // 3. حذف Test Cases المرتبطة بالمشكلة
    await prisma.testCase.deleteMany({
        where: { problemId: id }
    });

    // 4. أخيراً حذف المشكلة نفسها
    await prisma.problem.delete({
        where: { id }
    });

    return { message: "Problem deleted successfully" };
};

exports.updateProblem = async (id, data, userId, userRole) => {
    // التحقق من وجود المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // التحقق من الصلاحيات (أدمن أو صاحب المشكلة)
    const isAdmin = userRole === "ADMIN";
    const isAuthor = problem.authorId === userId;

    if (!isAdmin && !isAuthor) {
        throw new Error("You do not have permission to edit this problem");
    }

    // تحديث المشكلة
    const updatedProblem = await prisma.problem.update({
        where: { id },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
            ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
            ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
            ...(data.memoryLimit !== undefined && { memoryLimit: data.memoryLimit })
        }
    });

    return updatedProblem;
};

// ترجمة المشكلة آلياً إلى العربية
// دالة مساعدة للترجمة باستخدام Google Translate مباشرة
async function translateText(text, targetLang) {
    const url = "https://translate.googleapis.com/translate_a/single";
    
    const params = {
        client: "gtx",
        sl: "auto",      // اللغة المصدر: تلقائي
        tl: targetLang,  // اللغة الهدف: العربية
        dt: "t",
        q: text
    };

    const response = await axios.get(url, { params });

    // الاستجابة تكون مصفوفة، نستخرج النص المترجم منها
    if (response.data && response.data[0] && Array.isArray(response.data[0])) {
        return response.data[0]
            .map(item => item[0])
            .join("");
    }

    throw new Error("Invalid translation response");
}

// ترجمة المشكلة آلياً إلى العربية
exports.translateProblem = async (id) => {
    const problem = await prisma.problem.findUnique({
        where: { id }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // إذا كانت الترجمة محفوظة بالفعل، نرجعها مباشرة
    if (problem.titleAr && problem.descriptionAr) {
        return {
            titleAr: problem.titleAr,
            descriptionAr: problem.descriptionAr,
            cached: true
        };
    }

    try {
        console.log("[Translate] Starting translation for problem:", id);

        // ترجمة العنوان والوصف معاً
        const [titleAr, descriptionAr] = await Promise.all([
            translateText(problem.title, "ar"),
            translateText(problem.description, "ar")
        ]);

        console.log("[Translate] Translation completed successfully");

        // حفظ الترجمة في قاعدة البيانات
        await prisma.problem.update({
            where: { id },
            data: {
                titleAr,
                descriptionAr
            }
        });

        return {
            titleAr,
            descriptionAr,
            cached: false
        };
    } catch (error) {
        console.error("[Translate] Error:", error.message);
        throw new Error("Failed to translate problem. Please try again.");
    }
};
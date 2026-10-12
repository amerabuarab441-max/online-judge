const prisma = require("../config/prisma");

// حساب حالة المسابقة بناءً على الوقت الحالي
const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) return "UPCOMING";
    if (now >= startTime && now <= endTime) return "RUNNING";
    return "FINISHED";
};

// إنشاء مسابقة جديدة
exports.createContest = async (data, userId) => {
    const { title, description, startTime, endTime, isPublic = true } = data;

    // التحقق من البيانات
    if (!title || !title.trim()) {
        throw new Error("Contest title is required");
    }

    if (!startTime || !endTime) {
        throw new Error("Start time and end time are required");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
        throw new Error("End time must be after start time");
    }

    const contest = await prisma.contest.create({
        data: {
            title,
            description: description || "",
            startTime: start,
            endTime: end,
            isPublic: Boolean(isPublic),
            creatorId: userId
        },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    return {
        ...contest,
        status: getContestStatus(contest)
    };
};

// جلب كل المسابقات
exports.getContests = async () => {
    const contests = await prisma.contest.findMany({
        include: {
            creator: {
                select: {
                    id: true,
                    username: true
                }
            },
            problems: {
                select: {
                    id: true
                }
            },
            participants: {
                select: {
                    id: true
                }
            }
        },
        orderBy: {
            startTime: "desc"
        }
    });

    return contests.map(contest => ({
        ...contest,
        status: getContestStatus(contest),
        problemCount: contest.problems.length,
        participantCount: contest.participants.length,
        problems: undefined,
        participants: undefined
    }));
};

// جلب تفاصيل مسابقة
exports.getContestById = async (contestId, userId) => {
    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true
                }
            },
            problems: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                            difficulty: true,
                            timeLimit: true,
                            memoryLimit: true
                        }
                    }
                },
                orderBy: {
                    index: "asc"
                }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            }
        }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    // التحقق إذا كان المستخدم منضمًا للمسابقة
    const isJoined = userId
        ? contest.participants.some(p => p.userId === userId)
        : false;

    // لا نكشف المشاكل إذا كانت المسابقة لم تبدأ بعد
    const status = getContestStatus(contest);
    const problems = status === "UPCOMING" ? [] : contest.problems;

    return {
        ...contest,
        problems,
        status,
        isJoined,
        participantCount: contest.participants.length
    };
};

// الانضمام إلى مسابقة
exports.joinContest = async (contestId, userId) => {
    const contest = await prisma.contest.findUnique({
        where: { id: contestId }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    const status = getContestStatus(contest);

    if (status === "FINISHED") {
        throw new Error("This contest has already ended");
    }

    // التحقق إذا كان المستخدم منضمًا بالفعل
    const existing = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId,
                userId
            }
        }
    });

    if (existing) {
        throw new Error("You have already joined this contest");
    }

    const participant = await prisma.contestParticipant.create({
        data: {
            contestId,
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    return participant;
};

// إضافة مشكلة إلى مسابقة
exports.addProblemToContest = async (contestId, problemId, userId) => {
    // التحقق من وجود المسابقة
    const contest = await prisma.contest.findUnique({
        where: { id: contestId }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    // التحقق من وجود المشكلة
    const problem = await prisma.problem.findUnique({
        where: { id: problemId }
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // التحقق من عدم تكرار المشكلة
    const existing = await prisma.contestProblem.findUnique({
        where: {
            contestId_problemId: {
                contestId,
                problemId
            }
        }
    });

    if (existing) {
        throw new Error("This problem is already in the contest");
    }

    // حساب الترتيب الجديد
    const lastProblem = await prisma.contestProblem.findFirst({
        where: { contestId },
        orderBy: { index: "desc" }
    });

    const newIndex = lastProblem ? lastProblem.index + 1 : 0;

    const contestProblem = await prisma.contestProblem.create({
        data: {
            contestId,
            problemId,
            index: newIndex
        },
        include: {
            problem: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true
                }
            }
        }
    });

    return contestProblem;
};

// حذف مشكلة من مسابقة
exports.removeProblemFromContest = async (contestId, problemId) => {
    const contestProblem = await prisma.contestProblem.findUnique({
        where: {
            contestId_problemId: {
                contestId,
                problemId
            }
        }
    });

    if (!contestProblem) {
        throw new Error("Problem not found in this contest");
    }

    await prisma.contestProblem.delete({
        where: {
            contestId_problemId: {
                contestId,
                problemId
            }
        }
    });
};

// حساب لوحة الصدارة (Leaderboard)
exports.getLeaderboard = async (contestId) => {
    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
            problems: {
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { index: "asc" }
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            }
        }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    // حساب التصنيفات تلقائياً إذا كانت المسابقة منتهية ولم تُحسب بعد
    const now = new Date();
    if (now > new Date(contest.endTime) && !contest.ratingsCalculated) {
        try {
            await exports.calculateContestRatings(contestId);
            // إعادة جلب المسابقة بعد التحديث
            const updatedContest = await prisma.contest.findUnique({
                where: { id: contestId },
                include: {
                    problems: {
                        include: {
                            problem: { select: { id: true, title: true } }
                        },
                        orderBy: { index: "asc" }
                    },
                    participants: {
                        include: {
                            user: { select: { id: true, username: true, rating: true } }
                        }
                    }
                }
            });
            if (updatedContest) {
                contest.participants = updatedContest.participants;
                contest.ratingsCalculated = true;
            }
        } catch (err) {
            console.log("[Rating] Auto-calculation skipped:", err.message);
        }
    }

    const problemIds = contest.problems.map(cp => cp.problemId);

    // جلب كل الـ submissions المقبولة خلال المسابقة
    const acceptedSubmissions = await prisma.submission.findMany({
        where: {
            contestId,
            status: "ACCEPTED",
            problemId: { in: problemIds },
            createdAt: {
                gte: contest.startTime,
                lte: contest.endTime
            }
        },
        select: {
            userId: true,
            problemId: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    // جلب عدد المحاولات الفاشلة لكل مستخدم ومشكلة
    const failedSubmissions = await prisma.submission.findMany({
        where: {
            contestId,
            status: {
                in: ["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR", "COMPILATION_ERROR"]
            },
            problemId: { in: problemIds },
            createdAt: {
                gte: contest.startTime,
                lte: contest.endTime
            }
        },
        select: {
            userId: true,
            problemId: true
        }
    });

    // بناء خريطة المحاولات الفاشلة
    const failedMap = {};
    for (const sub of failedSubmissions) {
        const key = `${sub.userId}_${sub.problemId}`;
        failedMap[key] = (failedMap[key] || 0) + 1;
    }

    // حساب النتيجة لكل مشارك
    // حساب النتيجة لكل مشارك (مع دعم المسابقات الافتراضية)
    const leaderboard = contest.participants.map(participant => {
        let score = 0;
        let penalty = 0;
        const solvedProblems = new Set();

        // تحديد وقت البداية المرجعي
        // للمسابقات الافتراضية: نستخدم وقت بدء المستخدم الخاص
        // للمسابقات العادية: نستخدم وقت بداية المسابقة
        const referenceStartTime = participant.isVirtual && participant.virtualStartTime
            ? new Date(participant.virtualStartTime)
            : new Date(contest.startTime);

        for (const sub of acceptedSubmissions) {
            if (sub.userId !== participant.userId) continue;
            if (solvedProblems.has(sub.problemId)) continue;

            solvedProblems.add(sub.problemId);
            score++;

            // حساب الوقت بالدقائق من وقت البداية المرجعي
            const timeToSolve = Math.floor(
                (new Date(sub.createdAt) - referenceStartTime) / 60000
            );

            // إضافة 20 دقيقة عقوبة لكل محاولة فاشلة قبل الحل
            const failedAttempts = failedMap[`${participant.userId}_${sub.problemId}`] || 0;
            penalty += Math.max(0, timeToSolve) + (failedAttempts * 20);
        }

        return {
            userId: participant.userId,
            username: participant.user.username,
            score,
            penalty,
            isVirtual: participant.isVirtual,
            ratingChange: participant.ratingChange,
            solvedProblems: Array.from(solvedProblems)
        };
    });

    // الترتيب: الأعلى نقاطًا أولاً، ثم الأقل عقوبة
    leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.penalty - b.penalty;
    });

    // إضافة الرتبة
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));

    return {
        contestId,
        contestTitle: contest.title,
        status: getContestStatus(contest),
        problems: contest.problems.map(cp => ({
            id: cp.problem.id,
            title: cp.problem.title,
            index: cp.index
        })),
        leaderboard: rankedLeaderboard
    };
};

// بدء مسابقة افتراضية
exports.startVirtualContest = async (contestId, userId) => {
    const contest = await prisma.contest.findUnique({
        where: { id: contestId }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    // التحقق إذا كان المستخدم منضمًا بالفعل
    const existing = await prisma.contestParticipant.findUnique({
        where: {
            contestId_userId: {
                contestId,
                userId
            }
        }
    });

    if (existing) {
        throw new Error("You have already joined this contest");
    }

    // حساب وقت نهاية المسابقة الافتراضية
    const now = new Date();
    const contestDuration = new Date(contest.endTime) - new Date(contest.startTime);
    const virtualEndTime = new Date(now.getTime() + contestDuration);

    const participant = await prisma.contestParticipant.create({
        data: {
            contestId,
            userId,
            isVirtual: true,
            virtualStartTime: now
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    });

    return {
        ...participant,
        virtualEndTime
    };
};

// حساب تصنيفات المسابقة (خوارزمية Elo)
exports.calculateContestRatings = async (contestId) => {
    const contest = await prisma.contest.findUnique({
        where: { id: contestId },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            rating: true
                        }
                    }
                }
            }
        }
    });

    if (!contest) {
        throw new Error("Contest not found");
    }

    // التحقق من أن المسابقة انتهت
    const now = new Date();
    if (now < new Date(contest.endTime)) {
        throw new Error("Cannot calculate ratings before contest ends");
    }

    // التحقق من أنها لم تُحسب من قبل
    if (contest.ratingsCalculated) {
        throw new Error("Ratings already calculated for this contest");
    }

    const participants = contest.participants.filter(p => !p.isVirtual);

    if (participants.length < 2) {
        throw new Error("Need at least 2 participants to calculate ratings");
    }

    // ترتيب المشاركين حسب أدائهم (المشاكل المحلولة ثم الـ penalty)
    const rankedParticipants = [...participants].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.penalty - b.penalty;
    });

    const N = rankedParticipants.length;
    const K = 100; // معامل التعلم

    const ratingUpdates = [];

    // حساب التغيير لكل مشارك
    for (let i = 0; i < N; i++) {
        const participant = rankedParticipants[i];
        const actualRank = i + 1;
        const myRating = participant.user.rating;

        // حساب المركز المتوقع
        let expectedRank = 1;
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const opponentRating = rankedParticipants[j].user.rating;
            // احتمال أن يتفوق المنافس عليّ
            const probabilityOpponentBeatsMe = 1 / (1 + Math.pow(10, (myRating - opponentRating) / 400));
            expectedRank += probabilityOpponentBeatsMe;
        }

        // حساب التغيير
        // إذا كان المركز الفعلي أفضل من المتوقع، التغيير موجب
        const ratingChange = Math.round(K * (expectedRank - actualRank) / N);

        ratingUpdates.push({
            participantId: participant.id,
            userId: participant.userId,
            oldRating: myRating,
            ratingChange: ratingChange,
            newRating: Math.max(100, myRating + ratingChange) // لا يقل عن 100
        });
    }

    // تطبيق التحديثات في قاعدة البيانات
    await prisma.$transaction(async (tx) => {
        for (const update of ratingUpdates) {
            // تحديث تصنيف المستخدم
            await tx.user.update({
                where: { id: update.userId },
                data: { rating: update.newRating }
            });

            // حفظ التغيير في سجل المشارك
            await tx.contestParticipant.update({
                where: { id: update.participantId },
                data: { ratingChange: update.ratingChange }
            });
        }

        // تحديث حالة المسابقة
        await tx.contest.update({
            where: { id: contestId },
            data: { ratingsCalculated: true }
        });
    });

    return {
        message: "Ratings calculated successfully",
        updates: ratingUpdates.map(u => ({
            username: participants.find(p => p.id === u.participantId)?.user.username,
            oldRating: u.oldRating,
            ratingChange: u.ratingChange,
            newRating: u.newRating
        }))
    };
};
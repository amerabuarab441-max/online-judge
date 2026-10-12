const prisma = require("../config/prisma");

// Get user profile with statistics
exports.getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            rating: true,
            createdAt: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Calculate statistics
    const totalSubmissions = await prisma.submission.count({
        where: { userId }
    });

    const acceptedSubmissions = await prisma.submission.count({
        where: { userId, status: "ACCEPTED" }
    });

    const solvedSubmissions = await prisma.submission.findMany({
        where: { userId, status: "ACCEPTED" },
        select: { problemId: true },
        distinct: ["problemId"]
    });

    const contestsParticipated = await prisma.contestParticipant.count({
        where: { userId }
    });

    const acceptanceRate = totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0;

    // Get recent submissions (last 5)
    const recentSubmissions = await prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
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

    // Get solved problems by difficulty
    const solvedProblemIds = solvedSubmissions.map(s => s.problemId);
    const solvedByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };

    if (solvedProblemIds.length > 0) {
        const solvedProblems = await prisma.problem.findMany({
            where: { id: { in: solvedProblemIds } },
            select: { difficulty: true }
        });

        solvedProblems.forEach(p => {
            if (solvedByDifficulty[p.difficulty] !== undefined) {
                solvedByDifficulty[p.difficulty]++;
            }
        });
    }

    return {
        ...user,
        stats: {
            totalSubmissions,
            acceptedSubmissions,
            problemsSolved: solvedProblemIds.length,
            contestsParticipated,
            acceptanceRate,
            solvedByDifficulty
        },
        recentSubmissions
    };
};

// Get global leaderboard
exports.getGlobalLeaderboard = async (limit = 50) => {
    // Get all users with their accepted submissions
    // Get all users with their accepted submissions and ratings
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            rating: true,
            createdAt: true,
            submissions: {
                where: { status: "ACCEPTED" },
                select: { problemId: true }
            }
        }
    });

    // Calculate stats for each user
    const leaderboard = users.map(user => {
        const solvedProblems = new Set(user.submissions.map(s => s.problemId));
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            rating: user.rating,
            joinedAt: user.createdAt,
            problemsSolved: solvedProblems.size,
            totalAccepted: user.submissions.length
        };
    });

    // Sort by rating (desc), then by problems solved (desc)
    leaderboard.sort((a, b) => {
        if (b.rating !== a.rating) {
            return b.rating - a.rating;
        }
        if (b.problemsSolved !== a.problemsSolved) {
            return b.problemsSolved - a.problemsSolved;
        }
        return b.totalAccepted - a.totalAccepted;
    });

    // Add rank and apply limit
    return leaderboard.slice(0, limit).map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
};
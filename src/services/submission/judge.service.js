const prisma = require("../../config/prisma");
const executionService = require("../execution/execution.service");

exports.judgeSubmission = async (submissionId) => {

const submission = await prisma.submission.findUnique({

    where: {
        id: submissionId
    },

    include: {

        problem: {

            include: {
                testCases: true
            }

        }

    }

});


if (!submission) {

    console.error(
        `[Judge] Submission not found: ${submissionId}`
    );

    return;

}


console.log(
    `[Judge] Start judging ${submissionId}`
);


// -----------------------------------------
// Set submission status to PENDING
// -----------------------------------------

await prisma.submission.update({

    where: {
        id: submissionId
    },

    data: {
        status: "PENDING",
        executionTime: null,
        memoryUsed: null,
        judgedAt: null
    }

});


// -----------------------------------------
// Remove previous results
// -----------------------------------------

await prisma.submissionResult.deleteMany({

    where: {
        submissionId
    }

});


let finalStatus = "ACCEPTED";

let totalExecutionTime = 0;

let maxMemoryUsed = null;

// -----------------------------------------
// Compile / Prepare
// -----------------------------------------

let compileResult;

if (submission.language === "cpp") {
    compileResult = await executionService.compileCpp(
        submission.id,
        submission.sourceCode
    );
} else if (submission.language === "python") {
    compileResult = await executionService.savePython(
        submission.id,
        submission.sourceCode
    );
} else {
    compileResult = { executionStatus: "COMPILE_ERROR" };
}

console.log(
    `[Judge] ${submission.language === "cpp" ? "Compile" : "Prepare"} result: ${compileResult.executionStatus}`
);


// -----------------------------------------
// Compilation Error (C++ only)
// -----------------------------------------

if (compileResult.executionStatus !== "OK") {

    finalStatus = "COMPILATION_ERROR";


} else {


    // -----------------------------------------
    // Run all test cases
    // -----------------------------------------

    for (
        const testCase of submission.problem.testCases
    ) {


        console.log(
            `[Judge] Running testcase ${testCase.id}`
        );


        let result;

if (submission.language === "cpp") {
    result = await executionService.runCpp(
        compileResult.submissionFolder,
        testCase.input,
        submission.problem.timeLimit,
        submission.problem.memoryLimit
    );
} else if (submission.language === "python") {
    result = await executionService.runPython(
        compileResult.submissionFolder,
        testCase.input,
        submission.problem.timeLimit,
        submission.problem.memoryLimit
    );
}


        console.log(result);


        // -----------------------------------------
        // Execution time
        // -----------------------------------------

        totalExecutionTime +=
            result.executionTime || 0;


        // -----------------------------------------
        // Maximum memory used
        // -----------------------------------------

        if (result.memoryUsed !== null) {

            if (
                maxMemoryUsed === null ||
                result.memoryUsed > maxMemoryUsed
            ) {

                maxMemoryUsed =
                    result.memoryUsed;

            }

        }


        // -----------------------------------------
        // Determine testcase status
        // -----------------------------------------

        let testcaseStatus = "ACCEPTED";

        let errorMessage = null;


        if (
            result.executionStatus ===
            "RUNTIME_ERROR"
        ) {

            testcaseStatus = "RUNTIME_ERROR";

            errorMessage =
                result.stderr || "Runtime error";

        }


        else if (
            result.executionStatus ===
            "TIME_LIMIT_EXCEEDED"
        ) {

            testcaseStatus =
                "TIME_LIMIT_EXCEEDED";

            errorMessage =
                "Time limit exceeded";

        }


        else if (
            result.executionStatus ===
            "MEMORY_LIMIT_EXCEEDED"
        ) {

            testcaseStatus =
                "MEMORY_LIMIT_EXCEEDED";

            errorMessage =
                result.stderr || "Memory limit exceeded";

        }


        else if (
            result.executionStatus !== "OK"
        ) {

            testcaseStatus =
                "RUNTIME_ERROR";

            errorMessage =
                result.stderr || "Execution error";

        }


        else {

            // -----------------------------------------
            // Compare output
            // -----------------------------------------

            console.log(
                "========== Compare =========="
            );

            console.log(
                "Expected:",
                JSON.stringify(testCase.output)
            );

            console.log(
                "Actual  :",
                JSON.stringify(result.stdout)
            );

            console.log(
                "============================="
            );


            if (
                result.stdout.trim() !==
                testCase.output.trim()
            ) {

                testcaseStatus =
                    "WRONG_ANSWER";

                errorMessage =
                    "Wrong answer";

            }

        }


        // -----------------------------------------
        // Save SubmissionResult
        // -----------------------------------------

        await prisma.submissionResult.create({

            data: {

                submissionId,

                testCaseId:
                    testCase.id,

                status:
                    testcaseStatus,

                executionTime:
                    result.executionTime ?? null,

                memoryUsed:
                    result.memoryUsed ?? null,

                actualOutput:
                    result.stdout ?? null,

                errorMessage

            }

        });


        console.log(
            `[Judge] Testcase ${testCase.id} verdict: ${testcaseStatus}`
        );


        // -----------------------------------------
        // Stop if testcase failed
        // -----------------------------------------

        if (
            testcaseStatus !== "ACCEPTED"
        ) {

            finalStatus =
                testcaseStatus;

            break;

        }

    }

}


// -----------------------------------------
// Delete temporary submission folder
// -----------------------------------------

if (
    compileResult.submissionFolder
) {

    executionService.deleteSubmissionFolder(

        compileResult.submissionFolder

    );

}


// -----------------------------------------
// Final verdict
// -----------------------------------------

console.log(
    `[Judge] Final verdict: ${finalStatus}`
);


// -----------------------------------------
// Update Submission
// -----------------------------------------

await prisma.submission.update({

    where: {
        id: submissionId
    },

    data: {

        status:
            finalStatus,

        executionTime:
            totalExecutionTime,

        memoryUsed:
            maxMemoryUsed,

        judgedAt:
            new Date()

    }

});


console.log(
    `[Judge] Submission ${submissionId} completed`
);

};

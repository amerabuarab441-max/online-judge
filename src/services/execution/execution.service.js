const fs = require("fs");
const path = require("path");

const compilerService = require("./compiler.service");
const runnerService = require("./runner.service");
const verdictService = require("./verdict.service");

const TEMP_DIR = path.join(__dirname, "../../temp");

// إنشاء المجلد إذا لم يكن موجوداً
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

function createSubmissionFolder(submissionId) {
    const submissionFolder = path.join(TEMP_DIR, submissionId);

    if (!fs.existsSync(submissionFolder)) {
        fs.mkdirSync(submissionFolder);
    }

    return submissionFolder;
}

function deleteSubmissionFolder(submissionFolder) {
    if (fs.existsSync(submissionFolder)) {
        fs.rmSync(submissionFolder, {
            recursive: true,
            force: true
        });
    }
}

exports.compileCpp = async (submissionId, sourceCode) => {
    const submissionFolder = createSubmissionFolder(submissionId);

    const result = await compilerService.compileCpp(
        submissionFolder,
        sourceCode
    );

    return {
        ...result,
        submissionFolder
    };
};

exports.savePython = (submissionId, sourceCode) => {
    const submissionFolder = createSubmissionFolder(submissionId);

    const result = compilerService.savePythonCode(
        submissionFolder,
        sourceCode
    );

    return {
        ...result,
        submissionFolder
    };
};

exports.runCpp = async (
    submissionFolder,
    input,
    timeLimit,
    memoryLimit
) => {
    const result = await runnerService.runCpp(
        submissionFolder,
        input,
        timeLimit,
        memoryLimit
    );

    return {
        executionStatus: verdictService.getExecutionStatus(result),
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        signal: result.signal,
        executionTime: result.executionTime,
        memoryUsed: null // سنحسّنه لاحقاً
    };
};

exports.runPython = async (
    submissionFolder,
    input,
    timeLimit,
    memoryLimit
) => {
    const result = await runnerService.runPython(
        submissionFolder,
        input,
        timeLimit,
        memoryLimit
    );

    return {
        executionStatus: verdictService.getExecutionStatus(result),
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        signal: result.signal,
        executionTime: result.executionTime,
        memoryUsed: null
    };
};

exports.deleteSubmissionFolder = deleteSubmissionFolder;
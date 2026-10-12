const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function runCommand(command, args) {
    return new Promise((resolve) => {

        const process = spawn(command, args);

        let stdout = "";
        let stderr = "";

        const startTime = Date.now();

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("close", (exitCode, signal) => {
            resolve({
                stdout,
                stderr,
                exitCode,
                signal,
                executionTime: Date.now() - startTime
            });
        });

    });
}

exports.compileCpp = async (submissionFolder, sourceCode) => {

    fs.writeFileSync(
        path.join(submissionFolder, "main.cpp"),
        sourceCode
    );

    const result = await runCommand("docker", [
        "run",
        "--rm",
        "-v",
        `${submissionFolder}:/app`,
        "gcc:latest",
        "bash",
        "-c",
        "cd /app && g++ main.cpp -o main"
    ]);

    return {
        executionStatus:
            result.exitCode === 0
                ? "OK"
                : "COMPILE_ERROR",

        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        signal: result.signal,
        executionTime: result.executionTime
    };
};

exports.savePythonCode = (submissionFolder, sourceCode) => {
    // Python لا تحتاج ترجمة، فقط نحفظ الملف
    fs.writeFileSync(
        path.join(submissionFolder, "solution.py"),
        sourceCode
    );

    return {
        executionStatus: "OK",
        stdout: "",
        stderr: "",
        exitCode: 0,
        signal: null,
        executionTime: 0
    };
};
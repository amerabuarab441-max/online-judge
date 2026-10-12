const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function runCommand(command, args) {
    return new Promise((resolve) => {
        const process = spawn(command, args);

        let stdout = "";
        let stderr = "";

        // حد أقصى لحجم المخرجات (1MB)
        const MAX_OUTPUT_SIZE = 1024 * 1024;
        let stdoutSize = 0;
        let stderrSize = 0;

        const startTime = Date.now();

        process.stdout.on("data", (data) => {
            if (stdoutSize < MAX_OUTPUT_SIZE) {
                stdout += data.toString();
                stdoutSize += data.length;
            }
        });

        process.stderr.on("data", (data) => {
            if (stderrSize < MAX_OUTPUT_SIZE) {
                stderr += data.toString();
                stderrSize += data.length;
            }
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

        process.on("error", (error) => {
            resolve({
                stdout,
                stderr: error.message,
                exitCode: 1,
                signal: null,
                executionTime: Date.now() - startTime
            });
        });
    });
}

exports.runCpp = async (
    submissionFolder,
    input,
    timeLimit,
    memoryLimit
) => {
    // كتابة ملف الإدخال
    fs.writeFileSync(
        path.join(submissionFolder, "input.txt"),
        input
    );

    const timeoutSeconds = Math.ceil(timeLimit / 1000);

    // إعدادات Docker المحسّنة للأمان
    const dockerArgs = [
        "run",
        "--rm",
        
        // 🛡️ عزل الشبكة - البرنامج لا يحتاج إنترنت
        "--network", "none",
        
        // 🛡️ حدود الذاكرة
        "--memory", `${memoryLimit}m`,
        "--memory-swap", `${memoryLimit}m`,
        
        // 🛡️ حدود المعالج
        "--cpus", "1",
        
        // 🛡️ حدود العمليات - منع fork bombs
        "--pids-limit", "64",
        
        // 🛡️ حذف كل Linux capabilities
        "--cap-drop", "ALL",
        
        // 🛡️ منع privilege escalation
        "--security-opt", "no-new-privileges",
        
        // 🛡️ filesystem للقراءة فقط
        "--read-only",
        
        // 🛡️ مجلد مؤقت قابل للكتابة
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
        
        // 🛡️ ربط مجلد البرنامج
        "-v", `${submissionFolder}:/app:rw`,
        
        // الصورة
        "gcc:latest",
        
        // الأمر
        "bash", "-c",
        `cd /app && timeout ${timeoutSeconds}s bash -c './main < input.txt'`
    ];

    return await runCommand("docker", dockerArgs);
};

exports.runPython = async (
    submissionFolder,
    input,
    timeLimit,
    memoryLimit
) => {
    // كتابة ملف الإدخال
    fs.writeFileSync(
        path.join(submissionFolder, "input.txt"),
        input
    );

    const timeoutSeconds = Math.ceil(timeLimit / 1000);

    // إعدادات Docker المحسّنة للأمان
    const dockerArgs = [
        "run",
        "--rm",
        
        // عزل الشبكة
        "--network", "none",
        
        // حدود الذاكرة
        "--memory", `${memoryLimit}m`,
        "--memory-swap", `${memoryLimit}m`,
        
        // حدود المعالج
        "--cpus", "1",
        
        // حدود العمليات
        "--pids-limit", "64",
        
        // حذف كل Linux capabilities
        "--cap-drop", "ALL",
        
        // منع privilege escalation
        "--security-opt", "no-new-privileges",
        
        // filesystem للقراءة فقط
        "--read-only",
        
        // مجلد مؤقت قابل للكتابة
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
        
        // ربط مجلد البرنامج
        "-v", `${submissionFolder}:/app:rw`,
        
        // صورة Python
        "python:3.11-slim",
        
        // الأمر
        "bash", "-c",
        `cd /app && timeout ${timeoutSeconds}s python3 solution.py < input.txt`
    ];

    return await runCommand("docker", dockerArgs);
};
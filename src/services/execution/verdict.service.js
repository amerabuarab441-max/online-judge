exports.getExecutionStatus = (result) => {

    if (result.exitCode === 124) {
        return "TIME_LIMIT_EXCEEDED";
    }

    if (
        result.exitCode === 137 ||
        result.stderr.includes("Killed")
    ) {
        return "MEMORY_LIMIT_EXCEEDED";
    }

    if (result.exitCode !== 0) {
        return "RUNTIME_ERROR";
    }

    return "OK";
};
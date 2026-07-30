const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const TEMP_DIR = path.join(__dirname, "../../temp");

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

exports.executeCpp = async (
    submissionId,
    sourceCode,
    input
) => {

    const submissionFolder = path.join(
        TEMP_DIR,
        submissionId
    );

    if (!fs.existsSync(submissionFolder)) {
        fs.mkdirSync(submissionFolder);
    }

    const sourceFile = path.join(
        submissionFolder,
        "main.cpp"
    );

    fs.writeFileSync(sourceFile, sourceCode);

    const inputFile = path.join(
    submissionFolder,
    "input.txt"
);

fs.writeFileSync(inputFile, input);
    const command = `docker run --rm -v "${submissionFolder}:/app" gcc:latest bash -c "cd /app && g++ main.cpp -o main && ./main < input.txt"`;

    return new Promise((resolve, reject) => {

        exec(command, (error, stdout, stderr) => {

            if (error) {
                return reject(stderr);
            }

            resolve(stdout);

        });

    });

};
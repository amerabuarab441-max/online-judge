const { exec } = require("child_process");


exports.runDocker = (command) => {

    return new Promise((resolve, reject) => {

        exec(command, (error, stdout, stderr) => {

            if (error) {
                reject(stderr || error.message);
                return;
            }


            resolve(stdout);

        });

    });

};
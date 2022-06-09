'use strict';

const jest = require('jest');
const {runCLI} =  require('jest-cli');
const ProjectConfig = jest.ProjectConfig;

const fs = require('fs');

const createSetupFile = (env) => {
    return Object.entries(env).map(([key, value]) => `process.env.${key}="${value}";`).join("\n");
};

module.exports.test = async (event, context, callback) => {
    try {
        // テンポラリファイルを使って、Jestにパラメータを渡す
        fs.writeFileSync("/tmp/setup.js", createSetupFile(process.env));

        const options = {
            roots: ["."],
            verbose: true,
            testRegex: "e2e\\.test\\.js",
            setupFilesAfterEnv: [
                "expect-puppeteer", // enable jest-puppeteer
                "/tmp/setup.js" // load parameters
            ]
        };

        // run jest tests
        const jestResults = await jest.runCLI(options, [__dirname]);
        const testResults = jestResults["results"];
        if (testResults["success"]) {
            return callback(null, testResults);
        } else {
            console.log(JSON.stringify(testResults));
            return callback(new Error("Test Failed: please see logs for more details"));
        }
    } catch (error) {
        return callback(error);
    }
};
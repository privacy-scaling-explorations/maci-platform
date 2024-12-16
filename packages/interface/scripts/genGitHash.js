/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const commitHash = execSync('git log --pretty=format:"%h" -n1').toString().trim();

const key = "NEXT_PUBLIC_COMMIT_HASH";

const envFile = path.resolve(__dirname, "../.env");

let data = "";
if (fs.existsSync(envFile)) {
  data = fs.readFileSync(envFile, "utf8");
}

const indexOfCommitHash = data.indexOf(key);

if (indexOfCommitHash === -1) {
  fs.writeFileSync(envFile, `${data}\n${key}=${commitHash}\n`, "utf8");
} else {
  const indexOfNextLine = data.indexOf("\n", indexOfCommitHash);
  fs.writeFileSync(
    envFile,
    data
      .slice(0, indexOfCommitHash)
      .concat(data.slice(indexOfNextLine + 1))
      .concat(`${key}=${commitHash}\n`),
    "utf8",
  );
}

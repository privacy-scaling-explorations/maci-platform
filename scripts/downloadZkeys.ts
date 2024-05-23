import * as tar from "tar";

import fs from "fs";
import https from "https";

import {
  INPUT_FLAG,
  DEFAULT_ZKEYS_URL,
  ZKEY_PATH,
  ARCHIVE_NAME,
} from "./constants";

/**
 * Download compressed zkey files from the zkey url
 */
export async function downloadZkeys(): Promise<void> {
  const zkeyURL = process.argv.includes(INPUT_FLAG)
    ? process.argv[process.argv.indexOf(INPUT_FLAG) + 1]
    : DEFAULT_ZKEYS_URL;

  if (!fs.existsSync(ZKEY_PATH)) {
    await fs.promises.mkdir(ZKEY_PATH);
  }

  if (fs.readdirSync(ZKEY_PATH).length > 0) {
    console.log("Zkey files are already downloaded.");
    return;
  }

  const file = fs.createWriteStream(ARCHIVE_NAME);

  https
    .get(zkeyURL, (response) => {
      console.log("This takes a lot of time, please wait...");
      response.pipe(file);

      file
        .on("finish", () => {
          file.close();

          tar.x({ f: ARCHIVE_NAME }).then(() => fs.promises.rm(ARCHIVE_NAME));
        })
        .on("error", () => fs.promises.unlink(ARCHIVE_NAME));
    })
    .on("error", () => fs.promises.unlink(ARCHIVE_NAME));
}

await downloadZkeys();

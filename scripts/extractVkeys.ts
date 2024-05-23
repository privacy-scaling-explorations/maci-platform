import { extractVkToFile } from "maci-cli/sdk";
import path from "path";

import {
  OUTPUT_FLAG,
  VKEY_PATH,
  ZKEY_PATH,
  DEFAULT_VKEY_FILENAME,
} from "./constants";

/**
 * Extract vkeys to a single json file from the downloaded zkey files
 */
export async function extractVkeys(): Promise<void> {
  const outputFilePath = process.argv.includes(OUTPUT_FLAG)
    ? path.resolve(
        VKEY_PATH,
        process.argv[process.argv.indexOf(OUTPUT_FLAG) + 1]!,
      )
    : path.resolve(VKEY_PATH, DEFAULT_VKEY_FILENAME);

  const processMessagesZkeyPathQv = path.resolve(
    ZKEY_PATH,
    "ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey",
  );
  const tallyVotesZkeyPathQv = path.resolve(
    ZKEY_PATH,
    "TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey",
  );
  const processMessagesZkeyPathNonQv = path.resolve(
    ZKEY_PATH,
    "ProcessMessagesNonQv_10-2-1-2_test/ProcessMessagesNonQv_10-2-1-2_test.0.zkey",
  );
  const tallyVotesZkeyPathNonQv = path.resolve(
    ZKEY_PATH,
    "TallyVotesNonQv_10-1-2_test/TallyVotesNonQv_10-1-2_test.0.zkey",
  );

  await extractVkToFile({
    processMessagesZkeyPathQv,
    tallyVotesZkeyPathQv,
    processMessagesZkeyPathNonQv,
    tallyVotesZkeyPathNonQv,
    outputFilePath,
  });
}

await extractVkeys();

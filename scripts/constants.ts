import path from "path";

export const ZKEY_PATH = "./zkeys";
export const VKEY_PATH = "./public";
export const DEFAULT_ZKEYS_URL =
  "https://maci-develop-fra.s3.eu-central-1.amazonaws.com/v1.3.0/maci_artifacts_10-2-1-2_test.tar.gz";
export const ARCHIVE_NAME = path.resolve(ZKEY_PATH, "maci_keys.tar.gz");
export const DEFAULT_VKEY_FILENAME = "vkeys.json";
export const INPUT_FLAG = "-i";
export const OUTPUT_FLAG = "-o";

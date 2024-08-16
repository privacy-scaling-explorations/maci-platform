const { buildPoseidonT3, buildPoseidonT4, buildPoseidonT5, buildPoseidonT6 } = require("maci-contracts");
const fs = require("fs");
const path = require("path");

const PATHS = [
  path.resolve(__dirname, "..", "artifacts"),
  path.resolve(__dirname, "..", "cache"),
  path.resolve(__dirname, "..", "typechain-types"),
];

module.exports = {
  onPreCompile: async () => {
    await Promise.all(
      PATHS.map((filepath) => fs.existsSync(filepath) && fs.promises.rm(filepath, { recursive: true })),
    );
  },
  onCompileComplete: async () => {
    await Promise.all([buildPoseidonT3(), buildPoseidonT4(), buildPoseidonT5(), buildPoseidonT6()]);
  },
};

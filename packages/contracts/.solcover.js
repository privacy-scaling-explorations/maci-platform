const { poseidonContract } = require("circomlibjs");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const PATHS = [
  path.resolve(__dirname, "..", "artifacts"),
  path.resolve(__dirname, "..", "cache"),
  path.resolve(__dirname, "..", "typechain-types"),
];

const buildPoseidon = async (numInputs) => {
  await hre.overwriteArtifact(`PoseidonT${numInputs + 1}`, poseidonContract.createCode(numInputs));
};

const buildPoseidonT3 = () => buildPoseidon(2);
const buildPoseidonT4 = () => buildPoseidon(3);
const buildPoseidonT5 = () => buildPoseidon(4);
const buildPoseidonT6 = () => buildPoseidon(5);

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

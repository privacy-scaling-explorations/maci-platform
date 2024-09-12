import childProcess from "child_process";
import fs from "fs";
import path from "path";

const FLATTEN_PATH = path.resolve(__dirname, "../build/flatten.sol");

async function generateUml(): Promise<void> {
  const { promisify } = await import("util");
  const execFile = promisify(childProcess.execFile);
  await execFile("pnpm", [
    "exec",
    "hardhat",
    "flatten",
    "./contracts/registryManager/EASRegistryManager.sol",
    "./contracts/registry/EASRegistry.sol",
  ]).then(({ stdout }) => fs.promises.writeFile(FLATTEN_PATH, stdout));

  await execFile("pnpm", [
    "exec",
    "sol2uml",
    "class",
    FLATTEN_PATH,
    "-o",
    path.resolve(__dirname, "../docs/diagram.svg"),
  ]).then(() => fs.promises.rm(FLATTEN_PATH));
}

generateUml();

import fs from "fs";
import path from "path";

const INPUT_ABI_FILENAME = path.resolve(
  __dirname,
  "../node_modules/maci-platform-contracts/build/artifacts/contracts/maci/Tally.sol/Tally.json",
);
const OUTPUT_FOLDER_ABI = path.resolve(__dirname, "../abi");
const OUTPUT_ABI_FILENAME = path.resolve(OUTPUT_FOLDER_ABI, "./Tally.json");

interface TInput {
  internalType: string;
  name: string;
  type: string;
  components?: TInput[];
}

interface AbiItem {
  inputs: TInput[];
}

// Need this script to clean abi because subgraph doesn't support multi-dimensional arrays
async function cleanAbi() {
  const data = await fs.promises
    .readFile(INPUT_ABI_FILENAME, "utf8")
    .then((json) => JSON.parse(json) as { abi: AbiItem[] });

  const abi = data.abi.filter(
    (item) =>
      !item.inputs.some(
        (input) =>
          input.internalType === "uint256[][][]" ||
          input.components?.some((component) => component.internalType === "uint256[][][]"),
      ),
  );

  if (!fs.existsSync(OUTPUT_FOLDER_ABI)) {
    await fs.promises.mkdir(OUTPUT_FOLDER_ABI);
  }

  await fs.promises.writeFile(OUTPUT_ABI_FILENAME, JSON.stringify({ ...data, abi }, null, 2));
}

cleanAbi();

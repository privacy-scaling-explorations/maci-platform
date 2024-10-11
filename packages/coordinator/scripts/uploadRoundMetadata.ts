import { put } from "@vercel/blob";
import { parse, isValid } from "date-fns";
import { enGB } from "date-fns/locale";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import * as readline from "readline";

export interface RoundMetadata {
  roundId: string;
  description: string;
  startsAt: Date;
  registrationEndsAt: Date;
  votingStartsAt: Date;
  votingEndsAt: Date;
}

interface IUploadMetadataProps {
  data: RoundMetadata;
  name: string;
}

const METADATA_PATH = path.resolve("./round-metadata.json");

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

/**
 * A function to check if the input string is a valid date
 * @param formattedDateStr a date string to be checked
 * @returns if the date string is valid or not
 */
function isValidDate(formattedDateStr: string) {
  const parsed = parse(`${formattedDateStr}Z`, "yyyy/M/d H:m:sX", new Date(), { locale: enGB });
  return isValid(parsed);
}

/**
 * This is a function for uploading metadata to the blob storage
 * @param data an object containing metadata information about the round
 * @param name the name of the round
 * @returns url of the uploaded metadata
 */
export async function uploadRoundMetadata({ data, name }: IUploadMetadataProps): Promise<string> {
  // NOTICE! this is when you use vercel storage, if you're using another tool, please change this part.
  const blob = await put(name, JSON.stringify(data), {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return blob.url;
}

/**
 * This function collect round information from the console
 * @returns an object containing information of the round
 */
export async function collectMetadata(): Promise<RoundMetadata> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askRoundId = () =>
    new Promise<string>((resolve) => {
      rl.question("How would you name your round? ", (answer) => {
        // eslint-disable-next-line no-console
        console.log(`Your roundId is: ${answer}`);
        resolve(answer);
      });
    });

  const askDescription = () =>
    new Promise<string>((resolve) => {
      rl.question("Could you briefly introduce this round? ", (answer) => {
        // eslint-disable-next-line no-console
        console.log(`Your round description is: ${answer}`);
        resolve(answer);
      });
    });

  const askStartTime = () =>
    new Promise<Date>((resolve, reject) => {
      rl.question(
        "When would you like to START this round? (Please respond in the format {Year}/{Month}/{Day} {Hour}:{Minute}:{Second} in YOUR time) ",
        (answer) => {
          const valid = isValidDate(answer);

          if (!valid) {
            reject(new Error("Please answer in valid format."));
          }

          // eslint-disable-next-line no-console
          console.log("You would like to start this round at:", answer);
          resolve(new Date(answer));
        },
      );
    });

  const askRegistrationEndTime = () =>
    new Promise<number>((resolve, reject) => {
      rl.question("Please specify the duration of application registration in seconds: ", (answer) => {
        const duration = Number(answer);

        if (!duration) {
          reject(new Error("Please answer in number."));
        }

        // eslint-disable-next-line no-console
        console.log(`Your application registration duration for this round is: ${answer}`);
        resolve(duration);
      });
    });

  const askVotingEndTime = () =>
    new Promise<number>((resolve, reject) => {
      rl.question("Please specify the duration of voting in seconds: ", (answer) => {
        const duration = Number(answer);

        if (!duration) {
          reject(new Error("Please answer in number."));
        }

        // eslint-disable-next-line no-console
        console.log(`Your voting duration for this round is: ${answer}`);
        resolve(duration);
      });
    });

  const roundId = await askRoundId();
  const description = await askDescription();
  const startsAt = await askStartTime();
  const registrationEndsIn = await askRegistrationEndTime();
  const votingEndsIn = await askVotingEndTime();

  rl.close();

  return {
    roundId,
    description,
    startsAt,
    registrationEndsAt: new Date(startsAt.getTime() + registrationEndsIn * 1000),
    votingStartsAt: new Date(startsAt.getTime() + registrationEndsIn * 1000),
    votingEndsAt: new Date(startsAt.getTime() + registrationEndsIn * 1000 + votingEndsIn * 1000),
  };
}

async function main(): Promise<void> {
  let metadata: RoundMetadata;

  // Try to read a metadata file first
  if (fs.existsSync(METADATA_PATH)) {
    metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8")) as RoundMetadata;
  } else {
    // If there's no metadata file provided, collect metadata from console
    metadata = await collectMetadata();
  }

  const url = await uploadRoundMetadata({ data: metadata, name: `${metadata.roundId}.json` });

  // eslint-disable-next-line no-console
  console.log("The url of uploaded metadata is:", url);
}

main();

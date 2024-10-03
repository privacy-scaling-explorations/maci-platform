import { put } from "@vercel/blob";
import { parse, isValid } from "date-fns";
import { enGB } from "date-fns/locale";
import dotenv from "dotenv";

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

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

function isValidDate(formattedDateStr: string) {
  const splitDate = formattedDateStr.split("-");
  const parsed = parse(`${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`, "P", new Date(), { locale: enGB });
  return isValid(parsed);
}

export async function uploadRoundMetadata({ data, name }: IUploadMetadataProps): Promise<string> {
  const blob = await put(name, JSON.stringify(data), {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

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
      rl.question("When would you like to start this round? (Please respond in the format yyyy-mm-dd) ", (answer) => {
        const valid = isValidDate(answer);

        if (!valid) {
          reject(new Error("Please answer in valid format."));
        }

        // eslint-disable-next-line no-console
        console.log("You would like to start this round at:", answer);
        resolve(new Date(answer));
      });
    });

  const askRegistrationEndTime = () =>
    new Promise<Date>((resolve, reject) => {
      rl.question(
        "When would you like to end the registration for applications? (Please respond in the format yyyy-mm-dd) ",
        (answer) => {
          const valid = isValidDate(answer);

          if (!valid) {
            reject(new Error("Please answer in valid format."));
          }

          // eslint-disable-next-line no-console
          console.log(`Your application registration end date for this round is: ${answer}`);
          resolve(new Date(answer));
        },
      );
    });

  const askVotingStartTime = () =>
    new Promise<Date>((resolve, reject) => {
      rl.question(
        "When would you like to start the voting for this round? (Please respond in the format yyyy-mm-dd) ",
        (answer) => {
          const valid = isValidDate(answer);

          if (!valid) {
            reject(new Error("Please answer in valid format."));
          }

          // eslint-disable-next-line no-console
          console.log(`Your voting start date for this round is: ${answer}`);
          resolve(new Date(answer));
        },
      );
    });

  const askVotingEndTime = () =>
    new Promise<Date>((resolve, reject) => {
      rl.question(
        "When would you like to end the voting for this round? (Please respond in the format yyyy-mm-dd) ",
        (answer) => {
          const valid = isValidDate(answer);

          if (!valid) {
            reject(new Error("Please answer in valid format."));
          }

          // eslint-disable-next-line no-console
          console.log(`Your voting end date for this round is: ${answer}`);
          resolve(new Date(answer));
        },
      );
    });

  const roundId = await askRoundId();
  const description = await askDescription();
  const startsAt = await askStartTime();
  const registrationEndsAt = await askRegistrationEndTime();
  const votingStartsAt = await askVotingStartTime();
  const votingEndsAt = await askVotingEndTime();

  rl.close();

  return {
    roundId,
    description,
    startsAt,
    registrationEndsAt,
    votingStartsAt,
    votingEndsAt,
  };
}

async function main(): Promise<void> {
  const metadata = await collectMetadata();
  const url = await uploadRoundMetadata({ data: metadata, name: `${metadata.roundId}.json` });

  // eslint-disable-next-line no-console
  console.log("The url of uploaded metadata is:", url);
}

main();

import dotenv from "dotenv";

import { ErrorCodes } from "./errors";

dotenv.config();

/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network: string): string => {
  const pimlicoAPIKey = process.env.PIMLICO_API_KEY;

  if (!pimlicoAPIKey) {
    throw new Error(ErrorCodes.PIMLICO_API_KEY_NOT_SET);
  }

  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${pimlicoAPIKey}`;
};

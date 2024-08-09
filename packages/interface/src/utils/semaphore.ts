import { Group, Identity, generateProof, type SemaphoreProof } from "@semaphore-protocol/core";
import { SemaphoreEthers, SemaphoreSubgraph } from "@semaphore-protocol/data";
import { AbiCoder, JsonRpcSigner } from "ethers";
import { getSemaphoreGatekeeperData } from "maci-cli/sdk";

import { config, getRPCURL, semaphoreEthersChain } from "~/config";

/**
 * Encodes the Semaphore Proof to be sent on chain
 * @param semaphoreProof - The proof object
 * @returns a string of the encoded data
 */
export const encodeSemaphoreProof = (semaphoreProof: SemaphoreProof): string => {
  const { merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points } = semaphoreProof;

  const encodedData = AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256[8]"],
    [merkleTreeDepth, merkleTreeRoot, nullifier, message, scope, points],
  );

  return encodedData;
};

/**
 * Get the semaphore proof for the user
 * @param signer - The signer to use to talk to the chain
 * @param identity - The identity to use to generate the semaphore proof
 * @returns a string of the encoded semaphore proof
 */
export const getSemaphoreProof = async (signer: JsonRpcSigner, identity: Identity): Promise<string> => {
  const { address: semaphoreContractAddress, groupId } = await getSemaphoreGatekeeperData({
    signer,
    maciAddress: config.maciAddress!,
  });

  const semaphore = config.semaphoreSubgraphUrl
    ? new SemaphoreSubgraph(config.semaphoreSubgraphUrl)
    : new SemaphoreEthers(getRPCURL() ?? semaphoreEthersChain(), {
        address: semaphoreContractAddress,
      });

  const groupResponse = await semaphore.getGroupMembers(groupId);

  const group = new Group(groupResponse);

  // the message doesn't really matter, what we care about is that scope = groupId
  const proof = await generateProof(identity, group, "message", groupId);

  const encodedProof = encodeSemaphoreProof(proof);

  return encodedProof;
};

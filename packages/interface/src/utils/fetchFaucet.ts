/* eslint-disable no-console */
import { ZKEdDSAEventTicketPCDClaim, ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { createWalletClient, http, isAddress, parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";

import { getDb } from "~/utils/db";

import type { PCD } from "@pcd/pcd-types";
import type { Groth16Proof } from "snarkjs";
import type { IFetchFaucetReturn } from "~/utils/types";

const localWalletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
});

const account = mnemonicToAccount(process.env.MNEMONIC!);
const amountToSend = parseUnits(process.env.FAUCET_AMOUNT!, 16);
const ZUPASS_SIGNER = "044e711fd3a1792a825aa896104da5276bbe710fd9b59dddea1aaf8d84535aaf";

/**
 * Handler for the faucet API.
 * @param address - The address requests the funds.
 * @param pcd - The pcd of that address.
 * @returns - amount they get if succeeded, error message if failed.
 */
export async function fetchFaucet(
  address: string,
  pcd: PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>,
): Promise<IFetchFaucetReturn> {
  /// Check if the address already claimed the faucet fund
  const db = await getDb();

  try {
    // check if the address is valid
    if (!isAddress(address)) {
      throw new Error("Invalid address.");
    }

    const alreadyUsed = await db
      .get("SELECT EXISTS(SELECT 1 FROM users WHERE pcd = ?)", pcd.id)
      .then((res) => res as boolean);

    if (alreadyUsed) {
      throw new Error("This account already claimed the fund.");
    }

    /// Check if the PCD is valid in several checks
    const isValid = await ZKEdDSAEventTicketPCDPackage.verify(pcd);

    if (!isValid) {
      throw new Error("This ZK ticket PCD is not valid.");
    }

    if (pcd.claim.signer[0] !== ZUPASS_SIGNER) {
      throw new Error("This PCD is not signed by Zupass.");
    }

    if (pcd.claim.partialTicket.eventId !== process.env.NEXT_PUBLIC_ZUPASS_EVENT_ID) {
      throw new Error("This PCD is not for this event.");
    }

    // send the funds
    await localWalletClient.sendTransaction({
      account,
      to: address,
      value: amountToSend,
    });

    // now save it to the database
    await db.run("INSERT INTO users (pcd) VALUES (?)", pcd.id);
  } catch (e) {
    return {
      amountToSend,
      error: e as Error,
    };
  } finally {
    await db.close();
  }

  return { amountToSend };
}

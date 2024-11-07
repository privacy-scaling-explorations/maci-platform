/* eslint-disable no-console */
import { ZKEdDSAEventTicketPCDClaim, ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { NextApiRequest, NextApiResponse } from "next";
import { createWalletClient, Hex, http, isAddress, parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";

import { getDb } from "~/utils/db";

import type { PCD } from "@pcd/pcd-types";
import type { Groth16Proof } from "snarkjs";

const localWalletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
});

const account = mnemonicToAccount(process.env.MNEMONIC!);
const amountToSend = parseUnits(process.env.FAUCET_AMOUNT!, 16);

/**
 * Handler for the faucet API endpoint.
 * @param req - The request object.
 * @param res - The response object.
 * @returns - The response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const db = await getDb();

  try {
    // we expect a JSON body with a pcd and an address
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { address, pcd }: { address: string; pcd: PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof> } = req.body;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const alreadyUsed = await db.get("SELECT * FROM users WHERE pcd = ?", pcd.id);

    // if already used just continue, they can still try to signup as they would have the funds to do so
    if (alreadyUsed) {
      res.status(204);
      return;
    }

    if (!isAddress(address)) {
      res.status(401).json("Invalid address");
    }

    if (!(await ZKEdDSAEventTicketPCDPackage.verify(pcd))) {
      console.error(`[ERROR] ZK ticket PCD is not valid`);
      res.status(200).json("Not valid");
      return;
    }

    if (pcd.claim.signer[0] !== "044e711fd3a1792a825aa896104da5276bbe710fd9b59dddea1aaf8d84535aaf") {
      console.error(`[ERROR] PCD is not signed by Zupass`);
      res.status(200).json("Not signed by Zupass");
      return;
    }

    if (pcd.claim.partialTicket.eventId !== process.env.NEXT_PUBLIC_ZUPASS_EVENT_ID) {
      console.error(`[ERROR] PCD is not for the correct event`);
      res.status(200).json("Wrong event");
      return;
    }

    // send the funds
    await localWalletClient.sendTransaction({
      account,
      to: address as Hex,
      value: amountToSend,
    });

    // now save it to the database
    await db.run("INSERT INTO users (pcd) VALUES (?)", pcd.id);

    // all good let's continue
    res.status(200).json("Success");
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
    return;
  } finally {
    await db.close();
  }
}

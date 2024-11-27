/* eslint-disable no-console */
import { uuidToBigInt } from "@pcd/util";
import { ZKEdDSAEventTicketPCDClaim, ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { ZupassGatekeeper__factory as ZupassGatekeeper } from "maci-platform-contracts/typechain-types";
import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";

import { gatekeeperAddress } from "~/config";
import { getDb } from "~/utils/db";

import type { PCD } from "@pcd/pcd-types";
import type { Groth16Proof } from "snarkjs";

/**
 * Handler for the faucet API endpoint.
 * @param req - The request object.
 * @param res - The response object.
 * @returns - The response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const db = await getDb();

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  try {
    // we expect a JSON body with a pcd and an address
    const { pcd } = req.body as {
      pcd: PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>;
    };

    const isValid = await ZKEdDSAEventTicketPCDPackage.verify(pcd);

    if (!isValid) {
      console.error(`[ERROR] ZK ticket PCD is not valid`);
      res.status(400).json("Not valid PCD");
      return;
    }

    const signedUp = await publicClient.readContract({
      address: gatekeeperAddress,
      abi: ZupassGatekeeper.abi,
      functionName: "registeredTickets",
      args: [uuidToBigInt(pcd.claim.partialTicket.ticketId!)],
    });

    if (!signedUp) {
      console.error(`[ERROR] Didn't vote in the round`);
      res.status(401).json("Didn't vote in the round");
      return;
    }

    const alreadyRegistered: { id: number; pcd: string } | undefined = await db.get(
      "SELECT id, pcd FROM users WHERE pcd = ?",
      pcd.claim.partialTicket.ticketId,
    );

    // if not in db, we save it so they can retrieve the poap with the same link
    if (!alreadyRegistered) {
      await db.run("INSERT INTO users (id, pcd) VALUES (null, ?)", pcd.claim.partialTicket.ticketId);
    }

    const result: { id: number } | undefined = await db.get(
      "SELECT id FROM users WHERE pcd = ?",
      pcd.claim.partialTicket.ticketId,
    );

    if (!process.env.POAPS_LINKS) {
      throw new Error("POAPS_LINKS environment variable is not defined");
    }
    const response = await fetch(process.env.POAPS_LINKS);
    const poapLinks = (await response.json()) as { links: string[] };
    const poapLink = result ? poapLinks.links[result.id - 1] : undefined;

    if (!poapLink) {
      res.status(500).json("No POAP link found");
      return;
    }
    res.status(200).json({ poap: poapLink });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
    return;
  } finally {
    await db.close();
  }
}

import { IncomingMessage } from "http";

import { ipfs } from "~/config";

import type { NextApiResponse, NextApiRequest, PageConfig } from "next";

function bufferize(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

export default async function blob(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const buffer = await bufferize(req);
  const formData = new FormData();
  formData.append("file", new Blob([buffer]), req.query.filename as string);

  const response = await fetch(`${ipfs.url}/api/v0/add`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ipfs.apiKey}:${ipfs.secret}`).toString("base64")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    res.status(response.status).json({ error: "Failed to upload to IPFS" });
    return;
  }

  const data: unknown = await response.json();

  res.status(200).json(data);
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

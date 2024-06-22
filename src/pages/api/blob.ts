import { put } from "@vercel/blob";

import type { NextApiResponse, NextApiRequest, PageConfig } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const blob = await put(req.query.filename as string, req, {
    access: "public",
  });

  res.status(200).json(blob);
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

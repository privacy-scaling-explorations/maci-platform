/* eslint-disable @typescript-eslint/no-var-requires */
const { createEnv } = require("@t3-oss/env-nextjs");
const { z } = require("zod");

module.exports = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CHAIN_NAME: z.enum([
      "ethereum",
      "optimism",
      "optimismSepolia",
      "scroll",
      "scrollSepolia",
      "optimismSepolia",
      "arbitrum",
      "linea",
      "sepolia",
      "base",
      "baseSepolia",
      "localhost",
    ]),

    NEXT_PUBLIC_FEEDBACK_URL: z.string().default("#"),

    // EAS Schemas
    NEXT_PUBLIC_ADMIN_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_APPROVAL_SCHEMA: z.string().startsWith("0x"),
    NEXT_PUBLIC_METADATA_SCHEMA: z.string().startsWith("0x"),

    NEXT_PUBLIC_EVENT_NAME: z.string().default("Add your event name"),
    NEXT_PUBLIC_EVENT_DESCRIPTION: z.string().default("Add your event description"),
    NEXT_PUBLIC_WALLETCONNECT_ID: z.string().optional(),
    NEXT_PUBLIC_ALCHEMY_ID: z.string().optional(),

    NEXT_PUBLIC_MACI_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_MACI_START_BLOCK: z.string().optional(),
    NEXT_PUBLIC_MACI_SUBGRAPH_URL: z.string().url().optional(),

    NEXT_PUBLIC_ROUND_LOGO: z.string().optional(),

    NEXT_PUBLIC_SEMAPHORE_SUBGRAPH: z.string().url().optional(),
    NEXT_PUBLIC_TREE_URL: z.string().url().optional(),

    NEXT_PUBLIC_COMMIT_HASH: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME,

    NEXT_PUBLIC_FEEDBACK_URL: process.env.NEXT_PUBLIC_FEEDBACK_URL,

    NEXT_PUBLIC_WALLETCONNECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
    NEXT_PUBLIC_ALCHEMY_ID: process.env.NEXT_PUBLIC_ALCHEMY_ID,

    NEXT_PUBLIC_ADMIN_ADDRESS: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
    NEXT_PUBLIC_APPROVAL_SCHEMA: process.env.NEXT_PUBLIC_APPROVAL_SCHEMA,
    NEXT_PUBLIC_METADATA_SCHEMA: process.env.NEXT_PUBLIC_METADATA_SCHEMA,

    NEXT_PUBLIC_EVENT_NAME: process.env.NEXT_PUBLIC_EVENT_NAME,
    NEXT_PUBLIC_EVENT_DESCRIPTION: process.env.NEXT_PUBLIC_EVENT_DESCRIPTION,

    NEXT_PUBLIC_MACI_ADDRESS: process.env.NEXT_PUBLIC_MACI_ADDRESS,
    NEXT_PUBLIC_MACI_START_BLOCK: process.env.NEXT_PUBLIC_MACI_START_BLOCK,
    NEXT_PUBLIC_MACI_SUBGRAPH_URL: process.env.NEXT_PUBLIC_MACI_SUBGRAPH_URL,

    NEXT_PUBLIC_ROUND_LOGO: process.env.NEXT_PUBLIC_ROUND_LOGO,

    NEXT_PUBLIC_SEMAPHORE_SUBGRAPH: process.env.NEXT_PUBLIC_SEMAPHORE_SUBGRAPH,
    NEXT_PUBLIC_TREE_URL: process.env.NEXT_PUBLIC_TREE_URL,

    NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

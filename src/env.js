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
    NEXT_PUBLIC_APPROVED_APPLICATIONS_SCHEMA: z
      .string()
      .default("0xebbf697d5d3ca4b53579917ffc3597fb8d1a85b8c6ca10ec10039709903b9277"),
    NEXT_PUBLIC_APPROVED_APPLICATIONS_ATTESTER: z.string().default("0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9"),
    NEXT_PUBLIC_APPLICATIONS_SCHEMA: z
      .string()
      .default("0x76e98cce95f3ba992c2ee25cef25f756495147608a3da3aa2e5ca43109fe77cc"),
    NEXT_PUBLIC_BADGEHOLDER_SCHEMA: z
      .string()
      .default("0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b"),
    NEXT_PUBLIC_BADGEHOLDER_ATTESTER: z.string().default("0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9"),
    NEXT_PUBLIC_PROFILE_SCHEMA: z
      .string()
      .default("0xac4c92fc5c7babed88f78a917cdbcdc1c496a8f4ab2d5b2ec29402736b2cf929"),

    NEXT_PUBLIC_ADMIN_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_APPROVAL_SCHEMA: z.string().startsWith("0x"),
    NEXT_PUBLIC_METADATA_SCHEMA: z.string().startsWith("0x"),

    NEXT_PUBLIC_EVENT_NAME: z.string().optional(),
    NEXT_PUBLIC_ROUND_ID: z.string(),
    NEXT_PUBLIC_WALLETCONNECT_ID: z.string().optional(),
    NEXT_PUBLIC_ALCHEMY_ID: z.string().optional(),

    NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK: z.string(),

    NEXT_PUBLIC_MACI_ADDRESS: z.string().startsWith("0x"),
    NEXT_PUBLIC_MACI_START_BLOCK: z.string().optional(),
    NEXT_PUBLIC_MACI_SUBGRAPH_URL: z.string().url().optional(),

    NEXT_PUBLIC_TALLY_URL: z.string().url(),

    NEXT_PUBLIC_POLL_MODE: z.enum(["qv", "non-qv"]).default("non-qv"),
    NEXT_PUBLIC_ROUND_LOGO: z.string().optional(),

    NEXT_PUBLIC_IPFS_URL: z.string().url(),
    NEXT_PUBLIC_IPFS_FETCHING_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME,

    NEXT_PUBLIC_FEEDBACK_URL: process.env.NEXT_PUBLIC_FEEDBACK_URL,

    NEXT_PUBLIC_APPROVED_APPLICATIONS_SCHEMA: process.env.NEXT_PUBLIC_APPROVED_APPLICATIONS_SCHEMA,
    NEXT_PUBLIC_APPROVED_APPLICATIONS_ATTESTER: process.env.NEXT_PUBLIC_APPROVED_APPLICATIONS_ATTESTER,
    NEXT_PUBLIC_APPLICATIONS_SCHEMA: process.env.NEXT_PUBLIC_APPLICATIONS_SCHEMA,
    NEXT_PUBLIC_BADGEHOLDER_SCHEMA: process.env.NEXT_PUBLIC_BADGEHOLDER_SCHEMA,
    NEXT_PUBLIC_BADGEHOLDER_ATTESTER: process.env.NEXT_PUBLIC_BADGEHOLDER_ATTESTER,
    NEXT_PUBLIC_PROFILE_SCHEMA: process.env.NEXT_PUBLIC_PROFILE_SCHEMA,

    NEXT_PUBLIC_WALLETCONNECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
    NEXT_PUBLIC_ALCHEMY_ID: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK: process.env.NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK,

    NEXT_PUBLIC_ADMIN_ADDRESS: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
    NEXT_PUBLIC_APPROVAL_SCHEMA: process.env.NEXT_PUBLIC_APPROVAL_SCHEMA,
    NEXT_PUBLIC_METADATA_SCHEMA: process.env.NEXT_PUBLIC_METADATA_SCHEMA,

    NEXT_PUBLIC_EVENT_NAME: process.env.NEXT_PUBLIC_EVENT_NAME,
    NEXT_PUBLIC_ROUND_ID: process.env.NEXT_PUBLIC_ROUND_ID,

    NEXT_PUBLIC_MACI_ADDRESS: process.env.NEXT_PUBLIC_MACI_ADDRESS,
    NEXT_PUBLIC_MACI_START_BLOCK: process.env.NEXT_PUBLIC_MACI_START_BLOCK,
    NEXT_PUBLIC_MACI_SUBGRAPH_URL: process.env.NEXT_PUBLIC_MACI_SUBGRAPH_URL,

    NEXT_PUBLIC_TALLY_URL: process.env.NEXT_PUBLIC_TALLY_URL,

    NEXT_PUBLIC_POLL_MODE: process.env.NEXT_PUBLIC_POLL_MODE,
    NEXT_PUBLIC_ROUND_LOGO: process.env.NEXT_PUBLIC_ROUND_LOGO,

    NEXT_PUBLIC_IPFS_URL: process.env.NEXT_PUBLIC_IPFS_URL,
    NEXT_PUBLIC_IPFS_FETCHING_URL: process.env.NEXT_PUBLIC_IPFS_FETCHING_URL,
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

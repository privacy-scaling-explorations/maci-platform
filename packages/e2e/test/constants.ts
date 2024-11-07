import dotenv from "dotenv";

dotenv.config();

export const NETWORKS = {
  optimismSepolia: {
    chainId: 11155420,
    name: "OP Sepolia",
    rpcUrl: `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID!}`,
    symbol: "ETH",
  },
};

// Define a test seed phrase and password
// Don't use it for production, only for e2e testing
export const SEED_PHRASE = process.env.TEST_MNEMONIC || "test test test test test test test test test test test junk";
export const PASSWORD = process.env.WALLET_PASSWORD || "Tester@1234";

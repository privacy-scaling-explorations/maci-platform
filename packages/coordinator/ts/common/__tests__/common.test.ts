import { genPimlicoRPCUrl } from "../accountAbstraction";
import { ErrorCodes } from "../errors";

describe("common", () => {
  describe("genPimlicoRPCUrl", () => {
    test("should return the correct RPCUrl", () => {
      const rpcUrl = genPimlicoRPCUrl("optimism-sepolia");
      expect(rpcUrl).toBeDefined();
      expect(rpcUrl).toContain("https://api.pimlico.io/v2/optimism-sepolia/rpc");
    });

    test("should throw when PIMLICO_API_KEY is not set", () => {
      delete process.env.PIMLICO_API_KEY;
      expect(() => genPimlicoRPCUrl("optimism-sepolia")).toThrow(ErrorCodes.PIMLICO_API_KEY_NOT_SET.toString());
    });
  });
});

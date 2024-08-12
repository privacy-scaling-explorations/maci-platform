/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network: string): string => {
    const pimlicoAPIKey = process.env.PIMLICO_API_KEY;

    if (!pimlicoAPIKey) {
        throw new Error("PIMLICO_API_KEY is not set");
    }

    return `https://api.pimlico.io/v2/${network}rpc?apikey=${pimlicoAPIKey}`;
};

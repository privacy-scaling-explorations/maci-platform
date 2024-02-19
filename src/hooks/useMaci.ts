import { signup } from "maci-cli/sdk";
import { type Signer } from "ethers";

import { api } from "~/utils/api";
import { config } from "~/config";

export function useMaci() {
    const userStateIndex = localStorage.getItem("maci-userstate-index");

    async function signUpMaci(attestation: string, pubKey: string, signer: Signer) {

        // 1. signup on maci
        const stateIndex = await signup({
            maciPubKey: pubKey,
            maciAddress: config.maciAddress!,
            sgDataArg: attestation,
            signer
        }); // --> not supported since it's using hardhat, but if we wanna use ethers instead, how? or just throw this function to server?
    
        // 2. save the state index to local storage
        localStorage.setItem("userstate-index", stateIndex.toString());
    }

    return {
        userStateIndex,
        isMaciSignedUp: userStateIndex !== null,
        signUpMaci
    }
}

export function useApprovedAttestation(address: string) {
    return api.voters.approvedAttestation.useQuery({ address });
} 
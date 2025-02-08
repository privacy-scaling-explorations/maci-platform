import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import axios from "axios";
import NodeRSA from "node-rsa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Types
interface PublicKeyResponse {
  publicKey: string;
}

interface ProofData {
  poll: number;
  maciContractAddress: string;
  tallyContractAddress: string;
  useQuadraticVoting: boolean;
  coordinatorPrivateKey: string;
}

interface MergeData {
  poll: number;
  maciContractAddress: string;
  sessionKeyAddress: string;
  approval: string;
}

// Fetch Public Key
export const usePublicKey = (): ReturnType<typeof useQuery<PublicKeyResponse>> =>
  useQuery<PublicKeyResponse>({
    queryKey: ["publicKey"],
    queryFn: async () => {
      const response = await apiClient.get<PublicKeyResponse>("/v1/proof/publicKey");
      return response.data;
    },
  });

// Encrypt Authorization Header
const encryptAuthHeader = (publicKey: string, signature: string, digest: string): string => {
  const key = new NodeRSA(publicKey, "pkcs8-public");
  return key.encrypt(`${signature}:${digest}`, "base64");
};

// Generate Proof
export const useGenerateProof = (
  publicKey: string,
  signature: string,
  digest: string,
): UseMutationResult<ProofData, Error, ProofData> =>
  useMutation<ProofData, Error, ProofData>({
    mutationFn: async (proofData: ProofData) => {
      const authHeader = encryptAuthHeader(publicKey, signature, digest);
      const response = await apiClient.post<ProofData>("/v1/proof/generate", proofData, {
        headers: { Authorization: authHeader },
      });
      return response.data;
    },
  });

// Merge Trees
export const useMergeTrees = (
  publicKey: string,
  signature: string,
  digest: string,
): UseMutationResult<MergeData, Error, MergeData> =>
  useMutation<MergeData, Error, MergeData>({
    mutationFn: async (mergeData: MergeData) => {
      const authHeader = encryptAuthHeader(publicKey, signature, digest);
      const response = await apiClient.post<MergeData>("/v1/proof/merge", mergeData, {
        headers: { Authorization: authHeader },
      });
      return response.data;
    },
  });

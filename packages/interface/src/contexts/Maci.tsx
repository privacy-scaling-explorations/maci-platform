/* eslint-disable no-console */
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { type StandardMerkleTreeData } from "@openzeppelin/merkle-tree/dist/standard";
import { type ZKEdDSAEventTicketPCD } from "@pcd/zk-eddsa-event-ticket-pcd/ZKEdDSAEventTicketPCD";
import { Identity } from "@semaphore-protocol/core";
import { isAfter } from "date-fns";
import { type Signer, BrowserProvider, AbiCoder } from "ethers";
import {
  signup,
  isRegisteredUser,
  publishBatch,
  type TallyData,
  type IGetPollData,
  getPoll,
  genKeyPair,
  GatekeeperTrait,
  getGatekeeperTrait,
  getHatsSingleGatekeeperData,
} from "maci-cli/sdk";
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

import { config } from "~/config";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { api } from "~/utils/api";
import { getHatsClient } from "~/utils/hatsProtocol";
import { generateWitness } from "~/utils/pcd";
import { getSemaphoreProof } from "~/utils/semaphore";

import type { IVoteArgs, MaciContextType, MaciProviderProps } from "./types";
import type { PCD } from "@pcd/pcd-types";
import type { EIP1193Provider } from "viem";
import type { Attestation } from "~/utils/types";

export const MaciContext = createContext<MaciContextType | undefined>(undefined);

/**
 * All MACI's related functionality is handled here
 * @param MaciProviderProps - the args to be passed to the provider
 * @returns The Context data (variables and functions)
 */
export const MaciProvider: React.FC<MaciProviderProps> = ({ children }: MaciProviderProps) => {
  const signer = useEthersSigner();
  const { address, isConnected, isDisconnected } = useAccount();

  const [isRegistered, setIsRegistered] = useState<boolean>();
  const [stateIndex, setStateIndex] = useState<string>();
  const [initialVoiceCredits, setInitialVoiceCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [pollData, setPollData] = useState<IGetPollData>();
  const [tallyData, setTallyData] = useState<TallyData>();
  const [treeData, setTreeData] = useState<StandardMerkleTreeData<string[]>>();

  const [semaphoreIdentity, setSemaphoreIdentity] = useState<Identity | undefined>();
  const [zupassProof, setZupassProof] = useState<PCD>();
  const [maciPrivKey, setMaciPrivKey] = useState<string | undefined>();
  const [maciPubKey, setMaciPubKey] = useState<string | undefined>();

  const [signatureMessage, setSignatureMessage] = useState<string>("");

  const [gatekeeperTrait, setGatekeeperTrait] = useState<GatekeeperTrait | undefined>();
  const [sgData, setSgData] = useState<string | undefined>();

  const { signMessageAsync } = useSignMessage();
  const user = api.maci.user.useQuery(
    { publicKey: maciPubKey ?? "" },
    { enabled: Boolean(maciPubKey && config.maciSubgraphUrl) },
  );

  const poll = api.maci.poll.useQuery(undefined, { enabled: Boolean(config.maciSubgraphUrl) });

  // fetch the gatekeeper trait
  useEffect(() => {
    if (!signer) {
      return;
    }

    const fetchGatekeeperType = async () => {
      const gatekeeperType = await getGatekeeperTrait({
        maciAddress: config.maciAddress!,
        signer: signer as Signer,
      });

      setGatekeeperTrait(gatekeeperType);
    };

    fetchGatekeeperType().catch(console.error);
  }, [signer]);

  // only fetch the attestations if the gatekeeper trait is EAS
  const attestations = api.voters.approvedAttestations.useQuery(
    {
      address,
    },
    { enabled: gatekeeperTrait === GatekeeperTrait.EAS },
  );

  // fetch the voting attestation (only if gatekeeper is EAS)
  const attestationId = useMemo(() => {
    const values = attestations.data?.valueOf() as Attestation[] | undefined;

    const attestation = values?.find(({ attester }) => config.admin === attester);

    return attestation?.id;
  }, [attestations]);

  // fetch setup sgData for MACI signup
  // the signup gatekeeper data will change based on the gatekeeper in use
  // for EAS it's the attestationId
  // for Semaphore it will be a proof being part of the group
  useEffect(() => {
    setIsLoading(true);

    // add custom logic for other gatekeepers here
    switch (gatekeeperTrait) {
      case GatekeeperTrait.Semaphore:
        if (!signer) {
          setIsLoading(false);
          return;
        }
        getSemaphoreProof(signer, semaphoreIdentity!)
          .then((proof) => {
            setSgData(proof);
          })
          .catch(console.error)
          .finally(() => {
            setIsLoading(false);
          });
        break;
      case GatekeeperTrait.EAS:
        setSgData(attestationId);
        setIsLoading(false);
        break;
      case GatekeeperTrait.Hats:
        if (!signer) {
          setIsLoading(false);
          return;
        }
        getHatsSingleGatekeeperData({
          maciAddress: config.maciAddress!,
          signer,
        }).then(({ criterionHat }) => {
          // we need to check if we are allowed to signup
          const hatsClient = getHatsClient();
          hatsClient.isWearerOfHat({ wearer: address!, hatId: BigInt(criterionHat.at(0)!) }).then((res) => {
            if (res) {
              // we don't need any specific value here, as it will check based on the address
              setSgData("0x0000000000000000000000000000000000000000000000000000000000000000");
            } else {
              setSgData(undefined);
            }
          });
        });
        setIsLoading(false);
        break;
      case GatekeeperTrait.Zupass:
        if (!signer) {
          setIsLoading(false);
          return;
        }
        if (zupassProof) {
          const proof = generateWitness(zupassProof as ZKEdDSAEventTicketPCD);
          const encodedProof = AbiCoder.defaultAbiCoder().encode(
            ["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256[38]"],
            // eslint-disable-next-line no-underscore-dangle
            [proof._pA, proof._pB, proof._pC, proof._pubSignals],
          );
          setSgData(encodedProof);
        }
        setIsLoading(false);
        break;
      case GatekeeperTrait.FreeForAll:
        setIsLoading(false);
        break;
      case GatekeeperTrait.MerkleProof:
        if (!signer) {
          setIsLoading(false);
          return;
        }
        if (!treeData) {
          setIsLoading(false);
          return;
        }
        try {
          const merkleTree = StandardMerkleTree.load(treeData);
          const proof = merkleTree.getProof([signer.address]);
          const encodedProof = AbiCoder.defaultAbiCoder().encode(["bytes32[]"], [proof]);
          setSgData(encodedProof);
        } catch (e) {
          setSgData(undefined);
        }
        setIsLoading(false);
        break;
      default:
        break;
    }
  }, [gatekeeperTrait, attestationId, semaphoreIdentity, signer, zupassProof]);

  // a user is eligible to vote if they pass certain conditions
  // with gatekeepers like EAS it is possible to determine whether you are allowed
  // just by fetching the attestation. On the other hand, with other
  // gatekeepers it might be more difficult to determine it
  // for instance with semaphore
  const isEligibleToVote = useMemo(
    () => gatekeeperTrait && (gatekeeperTrait === GatekeeperTrait.FreeForAll || Boolean(sgData)) && Boolean(address),
    [sgData, address, gatekeeperTrait],
  );

  // on load get the key pair from local storage and set the signature message
  useEffect(() => {
    setSignatureMessage(`Generate your EdDSA Key Pair at ${window.location.origin}`);
    const storedMaciPrivKey = localStorage.getItem("maciPrivKey");
    const storedMaciPubKey = localStorage.getItem("maciPubKey");
    const storedSemaphoreIdentity = localStorage.getItem("semaphoreIdentity");

    if (storedMaciPrivKey && storedMaciPubKey) {
      setMaciPrivKey(storedMaciPrivKey);
      setMaciPubKey(storedMaciPubKey);
    }

    if (storedSemaphoreIdentity) {
      setSemaphoreIdentity(new Identity(storedSemaphoreIdentity));
    }
  }, [setMaciPrivKey, setMaciPubKey, setSemaphoreIdentity]);

  // on load we fetch the data from the poll
  useEffect(() => {
    if (poll.data) {
      return;
    }

    poll.refetch().catch(console.error);
  }, [poll]);

  // generate the maci keypair using a ECDSA signature
  const generateKeypair = useCallback(async () => {
    // if we are not connected then do not generate the key pair
    if (!address) {
      return;
    }

    const signature = await signMessageAsync({ message: signatureMessage });
    const newSemaphoreIdentity = new Identity(signature);
    const userKeyPair = genKeyPair({ seed: BigInt(signature) });
    localStorage.setItem("maciPrivKey", userKeyPair.privateKey);
    localStorage.setItem("maciPubKey", userKeyPair.publicKey);
    localStorage.setItem("semaphoreIdentity", newSemaphoreIdentity.privateKey.toString());
    setMaciPrivKey(userKeyPair.privateKey);
    setMaciPubKey(userKeyPair.publicKey);
    setSemaphoreIdentity(newSemaphoreIdentity);
  }, [address, signatureMessage, signMessageAsync, setMaciPrivKey, setMaciPubKey, setSemaphoreIdentity]);

  const storeZupassProof = useCallback(
    (proof: PCD) => {
      setZupassProof(proof);
    },
    [setZupassProof],
  );

  // memo to calculate the voting end date
  const votingEndsAt = useMemo(
    () =>
      pollData && pollData.duration !== 0
        ? new Date(Number(pollData.deployTime) * 1000 + Number(pollData.duration) * 1000)
        : undefined,
    [pollData?.deployTime, pollData?.duration],
  );

  // function to be used to signup to MACI
  const onSignup = useCallback(
    async (onError: () => void) => {
      if (!signer || !maciPubKey || (gatekeeperTrait && gatekeeperTrait !== GatekeeperTrait.FreeForAll && !sgData)) {
        return;
      }

      setIsLoading(true);

      try {
        const { stateIndex: index, voiceCredits } = await signup({
          maciPubKey,
          maciAddress: config.maciAddress!,
          sgDataArg: sgData,
          signer,
        });

        if (index) {
          setIsRegistered(true);
          setStateIndex(index);
          setInitialVoiceCredits(voiceCredits);
        }
      } catch (e) {
        onError();
        console.error("signup error:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [maciPubKey, signer, setIsRegistered, setStateIndex, setInitialVoiceCredits, setIsLoading, sgData],
  );

  // function to be used to vote on a poll
  const onVote = useCallback(
    async (votes: IVoteArgs[], onError: () => Promise<void>, onSuccess: () => Promise<void>) => {
      if (!signer || !stateIndex || !pollData) {
        return;
      }

      if (!votes.length) {
        onError();
        setError("No votes provided");
        return;
      }

      const messages = votes.map(({ newVoteWeight, voteOptionIndex }, index) => ({
        newVoteWeight,
        voteOptionIndex,
        stateIndex: BigInt(stateIndex),
        maciContractAddress: config.maciAddress!,
        nonce: BigInt(index + 1),
      }));

      setIsLoading(true);

      await publishBatch({
        messages,
        maciAddress: config.maciAddress!,
        publicKey: maciPubKey!,
        privateKey: maciPrivKey!,
        pollId: BigInt(pollData.id),
        signer,
      })
        .then(() => onSuccess())
        .catch((err: Error) => {
          setError(err.message);
          return onError();
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [stateIndex, pollData, maciPubKey, maciPrivKey, signer, setIsLoading, setError],
  );

  useEffect(() => {
    if (isDisconnected) {
      setMaciPrivKey(undefined);
      setMaciPubKey(undefined);
      setSemaphoreIdentity(undefined);
      localStorage.removeItem("maciPrivKey");
      localStorage.removeItem("maciPubKey");
      localStorage.removeItem("semaphoreIdentity");
      localStorage.removeItem("zupassProof");
    }
  }, [isDisconnected]);

  useEffect(() => {
    generateKeypair().catch(console.error);
  }, [generateKeypair]);

  useEffect(() => {
    if (!maciPubKey || user.data) {
      return;
    }

    user.refetch().catch(console.error);
  }, [maciPubKey, user]);

  // check if the user already registered
  useEffect(() => {
    if (!isConnected || !signer || !maciPubKey || !address || isLoading) {
      return;
    }

    const [account] = user.data?.accounts.slice(-1) ?? [];

    if (!config.maciSubgraphUrl) {
      isRegisteredUser({
        maciPubKey,
        maciAddress: config.maciAddress!,
        startBlock: config.maciStartBlock,
        signer,
      })
        .then(({ isRegistered: registered, voiceCredits, stateIndex: index }) => {
          setIsRegistered(registered);
          setStateIndex(index);
          setInitialVoiceCredits(Number(voiceCredits));
        })
        .catch(console.error);
    } else if (account) {
      const { id, voiceCreditBalance } = account;

      setIsRegistered(true);
      setStateIndex(id);
      setInitialVoiceCredits(Number(voiceCreditBalance));
    }
  }, [
    isLoading,
    isConnected,
    isRegistered,
    maciPubKey,
    address,
    signer,
    stateIndex,
    user.data,
    setIsRegistered,
    setStateIndex,
    setInitialVoiceCredits,
  ]);

  /// check the poll data and tally data
  useEffect(() => {
    setIsLoading(true);

    // if we have the subgraph url then it means we can get the poll data through there
    if (config.maciSubgraphUrl) {
      if (!poll.data) {
        setIsLoading(false);
        return;
      }

      const { isMerged, id } = poll.data;

      setPollData(poll.data);

      if (isMerged) {
        fetch(`${config.tallyUrl}/tally-${id}.json`)
          .then((res) => res.json() as Promise<TallyData>)
          .then((res) => {
            setTallyData(res);
          })
          .catch(() => undefined);
      }

      setIsLoading(false);
    } else {
      if (!window.ethereum) {
        setIsLoading(false);
        return;
      }

      const provider = new BrowserProvider(window.ethereum as unknown as EIP1193Provider, {
        chainId: config.network.id,
        name: config.network.name,
      });

      getPoll({
        maciAddress: config.maciAddress!,
        provider,
      })
        .then((data) => {
          setPollData(data);
          return data;
        })
        .then(async (data) => {
          if (!data.isMerged || (votingEndsAt && isAfter(votingEndsAt, new Date()))) {
            return undefined;
          }

          return fetch(`${config.tallyUrl}/tally-${data.id}.json`)
            .then((res) => res.json() as Promise<TallyData>)
            .then((res) => {
              setTallyData(res);
            })
            .catch(() => undefined);
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [signer, votingEndsAt, setIsLoading, setTallyData, setPollData, poll.data]);

  /// check the tree data
  useEffect(() => {
    // if we have the tree url then it means we can get the tree data through there
    if (config.treeUrl) {
      setIsLoading(true);
      fetch(config.treeUrl)
        .then((res) => res.json())
        .then((res: StandardMerkleTreeData<string[]>) => {
          setTreeData(res);
        })
        .catch(() => undefined);

      setIsLoading(false);
    }
  }, [setIsLoading]);

  const value = useMemo(
    () => ({
      isLoading,
      isEligibleToVote,
      initialVoiceCredits,
      votingEndsAt,
      stateIndex,
      isRegistered: isRegistered ?? false,
      pollId: pollData?.id.toString(),
      error,
      pollData,
      tallyData,
      maciPubKey,
      onSignup,
      onVote,
      gatekeeperTrait,
      storeZupassProof,
      treeData,
    }),
    [
      isLoading,
      isEligibleToVote,
      initialVoiceCredits,
      votingEndsAt,
      stateIndex,
      isRegistered,
      pollData,
      tallyData,
      error,
      maciPubKey,
      onSignup,
      onVote,
      gatekeeperTrait,
      storeZupassProof,
      treeData,
    ],
  );

  return <MaciContext.Provider value={value as MaciContextType}>{children}</MaciContext.Provider>;
};

export const useMaci = (): MaciContextType => {
  const maciContext = useContext(MaciContext);

  if (!maciContext) {
    throw new Error("Should use context inside provider.");
  }

  return maciContext;
};

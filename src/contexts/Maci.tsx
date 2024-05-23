import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { isAfter } from "date-fns";
import {
  signup,
  isRegisteredUser,
  publishBatch,
  type TallyData,
  type IGetPollData,
  getPoll,
} from "maci-cli/sdk";

import type { Attestation } from "~/utils/fetchAttestations";
import { config } from "~/config";
import { api } from "~/utils/api";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { MaciService } from "~/services";
import {
  type IVoteArgs,
  type MaciContextType,
  type MaciProviderProps,
} from "./types";

export const MaciContext = createContext<MaciContextType | undefined>(
  undefined,
);

export const MaciProvider: React.FC<MaciProviderProps> = ({ children }) => {
  const { data } = useSession();
  const signer = useEthersSigner();
  const { address, isConnected } = useAccount();

  const [isRegistered, setIsRegistered] = useState<boolean>();
  const [stateIndex, setStateIndex] = useState<string>();
  const [initialVoiceCredits, setInitialVoiceCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [pollData, setPollData] = useState<IGetPollData>();
  const [tallyData, setTallyData] = useState<TallyData>();
  const [maciAddress, setMaciAddress] = useState<string>();

  const attestations = api.voters.approvedAttestations.useQuery({
    address,
  });

  const attestationId = useMemo(() => {
    const values = attestations.data?.valueOf() as Attestation[] | undefined;

    const attestation = values?.find((attestation) =>
      config.admin === attestation.attester,
    );

    return attestation?.id;
  }, [attestations]);

  const isEligibleToVote = useMemo(
    () => !!attestationId && !!data,
    [attestationId, data],
  );

  const maciService = useMemo(
    () => (!!signer ? new MaciService(signer) : undefined),
    [signer],
  );

  const votingEndsAt = useMemo(
    () =>
      pollData
        ? new Date(
            Number(pollData.deployTime) * 1000 +
              Number(pollData.duration) * 1000,
          )
        : new Date(),
    [pollData?.deployTime, pollData?.duration],
  );

  const onSignup = useCallback(
    async (onError: () => void) => {
      if (!data?.publicKey || !signer || !attestationId || !maciAddress) {
        return;
      }

      setIsLoading(true);

      try {
        const { stateIndex: index, hash } = await signup({
          maciPubKey: data.publicKey,
          maciAddress,
          sgDataArg: attestationId,
          signer,
        });

        console.log(`Signup transaction hash: ${hash}`);

        if (index) {
          setIsRegistered(true);
          setStateIndex(index);
        }
      } catch (e) {
        onError();
        console.error("error happened:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [
      attestationId,
      data?.publicKey,
      address,
      signer,
      maciService,
      maciAddress,
      setIsRegistered,
      setStateIndex,
      setIsLoading,
    ],
  );

  const onVote = useCallback(
    async (
      votes: IVoteArgs[],
      onError: () => Promise<void>,
      onSuccess: () => Promise<void>,
    ) => {
      if (!signer || !data || !stateIndex || !pollData || !maciAddress) {
        return;
      }

      if (!votes.length) {
        await onError();
        setError("No votes provided");
        return;
      }

      const messages = votes.map(
        ({ newVoteWeight, voteOptionIndex }, index) => ({
          newVoteWeight,
          voteOptionIndex,
          stateIndex: BigInt(stateIndex),
          maciContractAddress: maciAddress,
          nonce: BigInt(index + 1),
        }),
      );

      setIsLoading(true);
      await publishBatch({
        messages,
        maciAddress: maciAddress,
        publicKey: data.publicKey,
        privateKey: data.privateKey,
        pollId: BigInt(pollData.id),
        signer,
      })
        .then(() => onSuccess())
        .catch((error: Error) => {
          setError(error.message);
          return onError();
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [
      stateIndex,
      pollData?.id,
      data?.publicKey,
      data?.privateKey,
      signer,
      maciAddress,
      setIsLoading,
      setError,
    ],
  );

  /// check if MACI contract is deployed and its address
  useEffect(() => {
    if (!signer || !maciService) return;

    maciService
      .getMaciAddress()
      .then((addr) => setMaciAddress(addr))
      .catch(console.error);
  }, [signer, maciService]);

  /// check if the user already registered
  useEffect(() => {
    if (
      !isConnected ||
      !signer ||
      !data?.publicKey ||
      !address ||
      isLoading ||
      !maciAddress
    ) {
      return;
    }

    isRegisteredUser({
      maciPubKey: data.publicKey,
      maciAddress,
      startBlock: config.maciStartBlock,
      signer,
    })
      .then(({ isRegistered: registered, voiceCredits, stateIndex: index }) => {
        setIsRegistered(registered);
        setStateIndex(index);
        setInitialVoiceCredits(Number(voiceCredits));
      })
      .catch(console.error);
  }, [
    isLoading,
    isConnected,
    isRegistered,
    data?.publicKey,
    address,
    signer,
    stateIndex,
    maciService,
    maciAddress,
    setIsRegistered,
    setStateIndex,
    setInitialVoiceCredits,
  ]);

  /// check the poll data and tally data
  useEffect(() => {
    if (!signer || !maciAddress) {
      return;
    }

    setIsLoading(true);
    Promise.all([
      getPoll({
        maciAddress,
        signer,
        provider: signer.provider,
      })
        .then((data) => {
          setPollData(data);
          return data;
        })
        .then(async (data) => {
          if (!data.isStateAqMerged || isAfter(votingEndsAt, new Date())) {
            return;
          }

          return fetch(`${config.tallyUrl}/tally-${data.id}.json`)
            .then((res) => res.json() as Promise<TallyData>)
            .then((res) => {
              setTallyData(res);
            })
            .catch(() => undefined);
        }),
    ])
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, [signer, maciAddress, setIsLoading, setTallyData, setPollData]);

  const value: MaciContextType = {
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
    maciAddress,
    onSignup,
    onVote,
  };

  return <MaciContext.Provider value={value}>{children}</MaciContext.Provider>;
};

export const useMaci = (): MaciContextType => {
  const context = useContext(MaciContext);

  if (!context) {
    throw new Error("Should use context inside provider.");
  }

  return context;
};

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAccountType } from "~/contexts/AccountType";
import useAccount from "~/hooks/useAccount";

import ConnectButton from "./ConnectButton";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";

export const SignInModal = (): JSX.Element => {
  const { storeAccountType } = useAccountType();
  const router = useRouter();
  const { login } = usePrivy();
  const { isConnected, isConnecting } = useAccount();

  const signInWithEmail = () => {
    storeAccountType("embedded");
    login();
    // eslint-disable-next-line no-console
    console.log("signInWithEmail");
  };

  useEffect(() => {
    if (isConnected) {
      router.push("/");
    }
  }, [isConnected]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Heading>Sign in</Heading>

      <Button size="auto" variant="primary" onClick={signInWithEmail}>
        Sign in with email
      </Button>

      {/* TODO: show mobile always */}
      {isConnecting ? <p>Connecting...</p> : <ConnectButton showMobile={false} />}
    </div>
  );
};

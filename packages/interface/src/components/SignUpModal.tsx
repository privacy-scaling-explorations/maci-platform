import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAccount } from "~/contexts/Account";

import ConnectButton from "./ConnectButton";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";

export const SignUpModal = (): JSX.Element => {
  const router = useRouter();
  const { login } = usePrivy();
  const { isConnected, isConnecting, storeAccountType } = useAccount();

  const signUpWithEmail = () => {
    storeAccountType("embedded");
    login();
    // eslint-disable-next-line no-console
    console.log("signUpWithEmail");
  };

  useEffect(() => {
    if (isConnected) {
      router.push("/");
    }
  }, [isConnected]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Heading>Sign up</Heading>

      <Button size="auto" variant="primary" onClick={signUpWithEmail}>
        Sign up with email
      </Button>

      {/* TODO: show mobile always */}
      {isConnecting ? <p>Connecting...</p> : <ConnectButton showMobile={false} />}
    </div>
  );
};

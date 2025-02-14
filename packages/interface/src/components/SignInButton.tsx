import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";

import { useAccount } from "~/contexts/Account";
import { useIsMobile } from "~/hooks/useIsMobile";

import { Button } from "./ui/Button";

interface ISignInButtonProps {
  showMobile: boolean;
  showMessage: boolean;
}

const SignInButton = ({ showMobile, showMessage }: ISignInButtonProps): JSX.Element | null => {
  const { isConnected } = useAccount();
  const isMobile = useIsMobile();

  const isShow = useMemo(() => showMobile === isMobile, [isMobile, showMobile]);

  return isShow ? (
    <div className="flex flex-col gap-1">
      {!isConnected && showMessage && <p className="text-gray-400">Already have an account?</p>}

      <Link className="flex justify-center" href="/signin">
        <Button className="normal-case" size="default" variant="tertiary">
          Sign in
        </Button>
      </Link>
    </div>
  ) : null;
};

export default dynamic(async () => Promise.resolve(SignInButton), { ssr: false });

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";

import { useAccount } from "~/contexts/Account";
import { useIsMobile } from "~/hooks/useIsMobile";

import { Button } from "./ui/Button";

interface ISignUpButtonProps {
  showMobile: boolean;
  showMessage: boolean;
}

const SignUpButton = ({ showMobile, showMessage }: ISignUpButtonProps): JSX.Element | null => {
  const { isConnected } = useAccount();
  const isMobile = useIsMobile();

  const isShow = useMemo(() => showMobile === isMobile, [isMobile, showMobile]);

  return isShow ? (
    <div className="flex flex-col gap-1">
      {!isConnected && showMessage && <p className="text-gray-400">Sign up to get started.</p>}

      <Link className="flex justify-center" href="/signup">
        <Button className="normal-case" size="default" variant="secondary">
          Sign Up
        </Button>
      </Link>
    </div>
  ) : null;
};

export default dynamic(async () => Promise.resolve(SignUpButton), { ssr: false });

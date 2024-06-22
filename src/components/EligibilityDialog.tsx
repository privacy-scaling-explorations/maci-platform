import { useAccount, useDisconnect } from "wagmi";

import { metadata } from "~/config";
import { useApprovedVoter } from "~/features/voters/hooks/useApprovedVoter";

import { Dialog } from "./ui/Dialog";

export const EligibilityDialog = (): JSX.Element | null => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data, isLoading, error } = useApprovedVoter(address!);

  if (isLoading || !address || error) {
    return null;
  }

  return (
    <Dialog
      isOpen={!data}
      size="sm"
      title={
        <>
          You are not eligible to vote <span className="font-serif">😔</span>
        </>
      }
      onOpenChange={() => {
        disconnect();
      }}
    >
      <div>
        <p className="mr-1">Only badgeholders are able to vote in {metadata.title}</p>
      </div>
    </Dialog>
  );
};

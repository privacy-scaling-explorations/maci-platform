import { UserRoundPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "viem";

import { IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form, FormControl, Textarea } from "~/components/ui/Form";
import { Spinner } from "~/components/ui/Spinner";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import { useApproveVoters } from "../hooks/useApproveVoters";
import { ApproveVotersSchema, type TApproveVoters } from "../types";

function parseAddresses(addresses = ""): string[] {
  return addresses
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => isAddress(addr))
    .filter((addr, i, arr) => arr.indexOf(addr) === i);
}

interface IApproveButtonProps {
  isLoading?: boolean;
  isAdmin?: boolean;
}

const ApproveButton = ({ isLoading = false, isAdmin = false }: IApproveButtonProps): JSX.Element => {
  const form = useFormContext<{ voters: string }>();
  const voters = form.watch("voters");

  const selectedCount = useMemo(() => parseAddresses(voters).length, [voters]);

  return (
    <IconButton
      suppressHydrationWarning
      disabled={!selectedCount || !isAdmin || isLoading}
      icon={isLoading ? Spinner : UserRoundPlus}
      type="submit"
      variant="primary"
    >
      {isAdmin ? `Approve ${selectedCount} voters` : "You must be an admin"}
    </IconButton>
  );
};

const ApproveVoters = () => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const [isOpen, setOpen] = useState(false);
  const approve = useApproveVoters({
    onSuccess: () => {
      toast.success("Voters approved successfully!");
      setOpen(false);
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Voter approve error", {
        description: err.reason ?? err.data?.message,
      }),
  });

  const buttonText = isAdmin ? `Add voters` : "You must be an admin";

  const handleSubmit = useCallback(
    (values: TApproveVoters) => {
      const voters = parseAddresses(values.voters);
      approve.mutate(voters);
    },
    [parseAddresses, approve],
  );

  const buttonOnClick = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <div>
      <IconButton
        disabled={!isAdmin || !isCorrectNetwork}
        icon={UserRoundPlus}
        variant="primary"
        onClick={buttonOnClick}
      >
        {!isCorrectNetwork ? `Connect to ${correctNetwork.name}` : buttonText}
      </IconButton>

      <Dialog
        description="Add voters who will be allowed to vote in the round. Enter all the addresses as a comma-separated list below. Duplicates and invalid addresses will automatically be removed."
        isOpen={isOpen}
        size="md"
        title="Approve voters"
        onOpenChange={setOpen}
      >
        <Form schema={ApproveVotersSchema} onSubmit={handleSubmit}>
          <div className="mb-2" />

          <FormControl name="voters">
            <Textarea placeholder="Comma-separated list of addresses to approve" rows={8} />
          </FormControl>

          <div className="flex items-center justify-end">
            <ApproveButton isAdmin={isAdmin} isLoading={approve.isPending} />
          </div>
        </Form>
      </Dialog>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ApproveVoters), { ssr: false });

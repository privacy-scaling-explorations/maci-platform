import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { tv } from "tailwind-variants";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { createComponent } from "~/components/ui";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { Notice } from "~/components/ui/Notice";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useProjectCount } from "~/features/projects/hooks/useProjects";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { ProjectAvatarWithName } from "./ProjectAvatarWithName";

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL!;

const Card = createComponent(
  "div",
  tv({
    base: "rounded-lg border border-blue-400 p-8 bg-blue-50 flex justify-between items-center gap-8 my-14",
  }),
);

export const BallotConfirmation = (): JSX.Element => {
  const { ballot, sumBallot } = useBallot();
  const allocations = ballot.votes;

  const { pollData } = useMaci();
  const { chain } = useAccount();
  const { data: projectCount } = useProjectCount({ registryAddress: pollData?.registry ?? zeroAddress, chain: chain! });

  const appState = useAppState();

  const sum = useMemo(() => formatNumber(sumBallot(ballot.votes)), [ballot, sumBallot]);

  return (
    <section>
      <Heading as="h2" className="tracking-tighter" size="4xl">
        Your ballot has been successfully submitted 🥳
      </Heading>

      <p className="mb-14 mt-4 text-gray-400">
        {`Thank you for participating in ${config.eventName} ${config.roundId} round.`}
      </p>

      <div className="mb-7 rounded-lg border border-gray-200 p-5">
        <b className="font-mono text-2xl uppercase">Summary of your ballot</b>

        <p className="my-8 text-gray-400">
          <span>{`Round you voted in: ${config.roundId}`} </span>

          <br />

          <span>{`Number of projects you voted for: ${allocations.length} of ${projectCount?.count}`}</span>
        </p>

        <div>
          {allocations.map((project) => (
            <div key={project.projectId} className="border-b border-gray-200 py-3">
              <ProjectAvatarWithName allocation={project.amount} id={project.projectId} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex w-full justify-end">
          <h4>Total votes allocated:</h4>

          <p>{sum}</p>
        </div>
      </div>

      <Notice
        content={config.resultsAt ? format(config.resultsAt, "d MMM yyyy hh:mm") : "The date would be announced soon."}
        title="Results will be available after tallying."
        variant="block"
      />

      {appState === EAppState.VOTING && (
        <Card>
          <div className="flex-3 flex flex-col gap-4">
            <b className="font-mono text-2xl uppercase">Changed your mind?</b>

            <p className="text-gray-400">Your can edit your ballot and resubmit it anytime during the voting period.</p>
          </div>

          <div>
            <Button as={Link} href="/ballot" variant="primary">
              Edit my ballot
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex-3 flex flex-col gap-4">
          <b className="font-mono text-2xl uppercase">{`Help us improve our next round of ${config.eventName}`}</b>

          <p className="text-gray-400">
            {`Your feedback will be influential to help us iterate on
            ${config.eventName} process.`}
          </p>
        </div>

        <div>
          <Button as={Link} href={feedbackUrl} target="_blank" variant="primary">
            Share your feedback
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex-3 flex flex-col gap-4">
          <b className="font-mono text-2xl uppercase">Want to run a round?</b>

          <p className="text-gray-400">
            Our code is open source so you can fork it and run a round anytime. If you need any assistance or want to
            share with us your awesomeness, find us at #🗳️-maci channel in PSE Discord.
          </p>
        </div>

        <div>
          <Button as={Link} href="https://discord.com/invite/sF5CT5rzrR" target="_blank" variant="primary">
            Contact us
          </Button>
        </div>
      </Card>
    </section>
  );
};

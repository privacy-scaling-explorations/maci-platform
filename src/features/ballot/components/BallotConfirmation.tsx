import { tv } from "tailwind-variants";
import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";

import { Button } from "~/components/ui/Button";
import { Notification } from "~/components/ui/Notification";
import { createComponent } from "~/components/ui";
import { config } from "~/config";
import { getAppState } from "~/utils/state";
import { useBallot } from "~/contexts/Ballot";
import { useProjectCount } from "~/features/projects/hooks/useProjects";
import { ProjectAvatarWithName } from "./ProjectAvatarWithName";
import { formatNumber } from "~/utils/formatNumber";
import { EAppState } from "~/utils/types";

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL;

const Card = createComponent(
  "div",
  tv({
    base: "rounded-lg border border-blue-400 p-8 bg-blue-50 flex justify-between items-center gap-8 my-14",
  }),
);

export const BallotConfirmation = () => {
  const { ballot, sumBallot } = useBallot();
  const allocations = ballot?.votes ?? [];
  const { data: projectCount } = useProjectCount();
  const appState = getAppState();

  const sum = useMemo(
    () => formatNumber(sumBallot(ballot?.votes)),
    [ballot, sumBallot],
  );

  return (
    <section>
      <h2 className="font-mono uppercase tracking-tighter">
        Your votes have been successfully submitted 🥳
      </h2>
      <p className="mb-14 mt-4 text-gray-400">
        Thank you for participating in {config.eventName} {config.roundId}{" "}
        round.
      </p>
      <div className="mb-7 rounded-lg border border-gray-200 p-5">
        <b className="font-mono text-2xl uppercase">Summary of your voting</b>
        <p className="my-8 text-gray-400">
          Round you voted in: {config.roundId} <br />
          Number of projects you voted for: {allocations.length} of{" "}
          {projectCount?.count}
        </p>
        <div>
          {allocations.map((project) => {
            return (
              <div className="border-b border-gray-200 py-3">
                <ProjectAvatarWithName
                  id={project.projectId}
                  allocation={project.amount}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex w-full justify-end">
          <h4>Total votes allocated:</h4>
          <p>{sum}</p>
        </div>
      </div>
      <Notification
        variant="block"
        title="Results will be available after tallying."
        content={format(config.resultsAt, "d MMM yyyy hh:mm")}
      />
      {appState === EAppState.VOTING && (
        <Card>
          <div className="flex-3 flex flex-col gap-4">
            <b className="font-mono text-2xl uppercase">
              Wanna change your mind?
            </b>
            <p className="text-gray-400">
              Your can edit your ballot and resubmit it anytime during the
              voting period.
            </p>
          </div>
          <div>
            <Button variant="primary" as={Link} href="/ballot">
              Edit my ballot
            </Button>
          </div>
        </Card>
      )}
      <Card>
        <div className="flex-3 flex flex-col gap-4">
          <b className="font-mono text-2xl uppercase">
            Help us improve our next round of {config.eventName}
          </b>
          <p className="text-gray-400">
            Your anonymized feedback will be influential to help us iterate on
            {config.eventName} process.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            as={Link}
            target="_blank"
            href={feedbackUrl}
          >
            Share your feedback
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex-3 flex flex-col gap-4">
          <b className="font-mono text-2xl uppercase">Want to run a round?</b>
          <p className="text-gray-400">
            Our code is open source so you can fork it and run a round anytime.
            If you need any assistance or want to share with us your
            awesomeness, find us at #🗳️-maci channel in PSE Discord.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            as={Link}
            target="_blank"
            href="https://discord.com/invite/sF5CT5rzrR"
          >
            Contact us
          </Button>
        </div>
      </Card>
    </section>
  );
};

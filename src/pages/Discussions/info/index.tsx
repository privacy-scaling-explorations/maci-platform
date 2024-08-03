import { config } from "~/config";
import { Layout } from "~/layouts/DefaultLayout";
import { cn } from "~/utils/classNames";
import { formatDate } from "~/utils/time";

const steps = [
  {
    label: "Registration",
    date: config.startsAt,
  },
  {
    label: "Review & Approval",
    date: config.registrationEndsAt,
  },
  {
    label: "Voting",
    date: config.reviewEndsAt,
  },
  {
    label: "Tallying",
    date: undefined,
  },
  {
    label: "Distribution",
    date: undefined,
  },
];

const InfoPage = (): JSX.Element => {
  const { progress, currentStepIndex } = calculateProgress(steps);

  return (
    <Layout>
      <div className="hidden h-4 w-4/5 overflow-hidden rounded-full border md:block">
        <div className="h-full bg-white transition-all" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="px-2 md:flex">
        {steps.map((step, i) => (
          <div
            key={step.label}
            className={cn("border-b border-l p-4 transition-opacity md:w-1/5", {
              "opacity-50": currentStepIndex <= i,
            })}
          >
            <h3 className="font-semibold">{step.label}</h3>

            {step.date instanceof Date && !Number.isNaN(step.date) && <div>{formatDate(step.date)}</div>}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default InfoPage;

function calculateProgress(items: { label: string; date?: Date }[]) {
  const now = Number(new Date());

  let currentStepIndex = items.findIndex(
    (step, index) => now < Number(step.date) && (index === 0 || now >= Number(items[index - 1]?.date)),
  );

  if (currentStepIndex === -1) {
    currentStepIndex = items.length;
  }

  let progress = 0;

  if (currentStepIndex > 0) {
    // Calculate progress for completed segments
    for (let i = 0; i < currentStepIndex - 1; i += 1) {
      progress += 1 / (items.length - 1);
    }

    // Calculate progress within the current segment
    const segmentStart = currentStepIndex === 0 ? 0 : Number(items[currentStepIndex - 1]?.date);
    const segmentEnd = Number(items[currentStepIndex]?.date);
    const segmentDuration = segmentEnd - segmentStart;
    const timeElapsedInSegment = now - segmentStart;

    progress += Math.min(timeElapsedInSegment, segmentDuration) / segmentDuration / (items.length - 1);
  }

  progress = Math.min(Math.max(progress, 0), 1);

  return { progress, currentStepIndex };
}

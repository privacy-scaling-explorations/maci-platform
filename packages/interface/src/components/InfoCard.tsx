import Image from "next/image";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { formatPeriod } from "~/utils/time";
import { EInfoCardState } from "~/utils/types";

const InfoCardContainer = createComponent(
  "div",
  tv({
    base: "rounded-md p-2 px-[10px] w-full",
    variants: {
      state: {
        [EInfoCardState.PASSED]: "border border-blue-500 bg-blue-50 text-blue-500 dark:bg-darkBlue dark:text-blue-800",
        [EInfoCardState.ONGOING]: "border border-blue-500 bg-blue-500 text-white",
        [EInfoCardState.UPCOMING]:
          "border border-gray-200 bg-transparent text-gray-200 dark:border-lighterBlack dark:text-gray-800",
      },
    },
  }),
);

interface InfoCardProps {
  state: EInfoCardState;
  title: string;
  start: Date;
  end: Date;
}

export const InfoCard = ({ state, title, start, end }: InfoCardProps): JSX.Element => (
  <InfoCardContainer state={state}>
    <div className="flex min-w-[200px] items-center justify-between">
      <span className="font-sans text-base font-extrabold uppercase leading-6 tracking-[0.16px]">{title}</span>

      {state === EInfoCardState.PASSED && (
        <Image alt="circle-check-blue" height="20" src="/circle-check-blue.svg" width="20" />
      )}

      {state === EInfoCardState.ONGOING && <div className="bg-green h-4 w-4 animate-pulse rounded-full" />}

      {state === EInfoCardState.UPCOMING && (
        <div className="h-4 w-4 rounded-full border-2 border-gray-200 bg-transparent dark:border-gray-800" />
      )}
    </div>

    <span className="font-sans text-sm font-medium leading-5">{formatPeriod({ start, end })}</span>
  </InfoCardContainer>
);

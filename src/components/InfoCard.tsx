import { tv } from "tailwind-variants";
import Image from "next/image";
import { format } from "date-fns";

import { createComponent } from "~/components/ui";
import { EInfoCardState } from "~/utils/types";

const InfoCardContainer = createComponent(
  "div",
  tv({
    base: "rounded-md p-2 max-lg:w-full lg:w-64",
    variants: {
      state: {
        [EInfoCardState.PASSED]:
          "border border-blue-500 bg-blue-50 text-blue-500",
        [EInfoCardState.ONGOING]:
          "border border-blue-500 bg-blue-500 text-white",
        [EInfoCardState.UPCOMING]:
          "border border-gray-200 bg-transparent text-gray-200",
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

export const InfoCard = ({ state, title, start, end }: InfoCardProps) => {
  return (
    <InfoCardContainer state={state}>
      <div className="flex items-center justify-between">
        <p className="uppercase">
          <b>{title}</b>
        </p>
        {state === EInfoCardState.PASSED ? (
          <Image alt="" width="20" height="20" src="/circle-check-blue.svg" />
        ) : state == EInfoCardState.ONGOING ? (
          <div className="h-4 w-4 rounded-full bg-green"></div>
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-gray-200 bg-transparent"></div>
        )}
      </div>
      <p>{formatDateString({ start, end })}</p>
    </InfoCardContainer>
  );
};

function formatDateString({ start, end }: { start: Date; end: Date }): string {
  const fullFormat = "d MMM yyyy";

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.getDate()} - ${format(end, fullFormat)}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMM")} - ${format(end, fullFormat)}`;
  } else {
    return `${format(start, fullFormat)} - ${format(end, fullFormat)}`;
  }
}

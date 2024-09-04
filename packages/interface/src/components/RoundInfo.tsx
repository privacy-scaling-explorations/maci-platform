import { Heading } from "~/components/ui/Heading";

export const RoundInfo = (): JSX.Element => (
  <div className="w-full border-b border-gray-200 pb-2">
    <h4>MUQA</h4>

    <div className="flex items-center gap-2">
      <Heading as="h3" size="3xl">
        Beach Contest
      </Heading>
    </div>
  </div>
);

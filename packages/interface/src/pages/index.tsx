import clsx from "clsx";
import Image from "next/image";

import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { FAQList } from "~/features/home/components/FaqList";
import { Layout } from "~/layouts/DefaultLayout";

const HomePage = (): JSX.Element => (
  <Layout type="home">
    <div className="flex h-auto w-screen flex-col items-center justify-center gap-4 bg-blue-50 px-2 sm:h-[90vh] dark:bg-black">
      <Heading className="mt-4 max-w-screen-lg text-center sm:mt-0" size="6xl">
        {config.eventName}
      </Heading>

      <Heading className="max-w-screen-lg text-center" size="3xl">
        {config.eventDescription}
      </Heading>

      <JoinButton />

      <Heading className="mt-4 max-w-screen-lg text-center" size="3xl">
        View the round Results
      </Heading>

      <Button className="mb-4 sm:mb-0" size="auto" variant="primary">
        <a href="/rounds/0/result">View the Results</a>
      </Button>

      <Image
        alt="arrow-down"
        className={clsx("absolute bottom-5 hidden sm:block dark:invert")}
        height="24"
        src="/arrow-down.svg"
        width="24"
      />
    </div>

    <FAQList />
  </Layout>
);

export default HomePage;

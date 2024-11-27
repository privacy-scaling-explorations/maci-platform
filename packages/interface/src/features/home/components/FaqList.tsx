import { Heading } from "~/components/ui/Heading";

import { FAQItem } from "./FaqItem";

export const FAQList = (): JSX.Element => (
  <div className="mt-14 flex flex-col items-center justify-center sm:mt-28 dark:text-white">
    <Heading size="6xl">FAQ</Heading>

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            At Devcon, we’re hosting a quadratic voting round to support key Ethereum dashboards that help the community
            learn about and understand relevant Ethereum data.
          </p>

          <p>
            Every Devcon attendee can participate in voting to decide how funds will be allocated to the most valuable
            dashboards, supporting these educational contributions to the ecosystem.
          </p>
        </div>
      }
      title="What is this voting round about?"
    />

    <FAQItem
      description="The projects in this round are authors of educational Ethereum dashboards. You can view the projects and vote for those you find most useful."
      title="What are the projects?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Everyone participating to Devcon SEA 2024 can vote, you will only need your Zupass as proof of attendance.
          </p>
        </div>
      }
      title="Who can vote and how?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>Minimal Anti-Collusion Infrastructure (MACI) is a private, on-chain, voting system.</p>

          <p>
            MACI is an open-source cryptographic protocol designed to facilitate secure, anonymous voting systems while
            minimizing the potential for collusion, manipulation and bribery using zero-knowledge proofs.
          </p>
        </div>
      }
      title="What is MACI?"
    />

    <FAQItem
      description={
        <div className="flex flex-col gap-4">
          <p>
            Join our
            <a className="font-bold underline" href="https://discord.gg/Bj9PWNVu" rel="noreferrer" target="_blank">
              Discord channel
            </a>
            to learn more, or come over to PSE&apos;s booth in the Impact Space!
          </p>
        </div>
      }
      title="Do you have any other questions?"
    />
  </div>
);

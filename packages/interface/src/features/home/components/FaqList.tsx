import { Heading } from "~/components/ui/Heading";

import { FAQItem } from "./FaqItem";

export const FAQList = (): JSX.Element => (
  <div className="mt-14 flex flex-col items-center justify-center sm:mt-28 dark:text-white">
    <Heading size="6xl">FAQ</Heading>

    <FAQItem
      description="(Please enter the main focus and description of this round.)"
      title="What is this voting round about?"
    />

    <FAQItem description="(This is related to what gatekeeper is used.)" title="What are the projects?" />

    <FAQItem description="(This is related to what gatekeeper is used.)" title="Who can vote and how?" />

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

    <FAQItem description="Join our Discord channel to learn more!" title="Do you have any other questions?" />
  </div>
);

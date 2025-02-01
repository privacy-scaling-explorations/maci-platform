import { Heading } from "~/components/ui/Heading";

import { FAQItem } from "./FaqItem";

export const FAQList = (): JSX.Element => (
  <div className="dark:bg-lightBlack flex flex-col items-center justify-center py-14 sm:pt-28 dark:text-white" id="FAQ">
    <Heading size="6xl">FAQ</Heading>

    <FAQItem
      description="(Please enter the main focus and description of this round.)"
      title="what is the focus of this round?"
    />

    <FAQItem
      description="(This is related to what gatekeeper is used.)"
      title="What are the requirements for participation?"
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

    <FAQItem description="Join our Discord channel to learn more!" title="Do you have any other questions?" />
  </div>
);

import { FAQItem } from "./FaqItem";

export const FAQList = (): JSX.Element => (
  <div className="mt-28 flex flex-col items-center justify-center">
    <h1 className="mb-8">FAQ</h1>

    <FAQItem
      description="(Please enter the main focus and description of this round.)"
      title="what is the focus of this round?"
    />

    <FAQItem
      description="(This is related to what gatekeeper is used.)"
      title="Who are the requirements for participation?"
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
      description="Join our Telegram group or Discord channel to learn more!"
      title="Do you have any other questions?"
    />
  </div>
);

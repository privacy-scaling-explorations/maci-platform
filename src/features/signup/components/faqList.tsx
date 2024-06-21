import { FAQItem } from "./faqItem";

export const FAQList = () => {
  return (
    <div className="mt-28 flex flex-col items-center justify-center">
      <h1 className="mb-8">FAQ</h1>
      <FAQItem
        title="what is the focus of this round?"
        description="This found is focused on supporting Mexican projects working on reducing the gender gap, collaborating with local communities, and ReFi."
      />
      <FAQItem
        title="Who are the requirements for participation?"
        description="To participate in this round as a project or as a voter, you must be a Mexican community member and have on-chain proofs, such as: POAPs, Unlock Protocol, NFTs or EAS."
      />
      <FAQItem
        title="What technologies will be used for voting?"
        description={
          <div className="flex flex-col gap-4">
            <p>
              This round will be enabled by EasyRetroPGF Hypercerts EAS and
              MACI, Minimal Anti-Collusion Infrastructure.
            </p>
            <p>
              MACI is an open-source cryptographic protocol designed to
              facilitate secure, anonymous voting systems while minimizing the
              potential for collusion, manipulation and bribery using
              zero-knowledge proofs.
            </p>
          </div>
        }
      />
      <FAQItem
        title="Do you have any other questions?"
        description="Join our Telegram group to learn more!"
      />
    </div>
  );
};

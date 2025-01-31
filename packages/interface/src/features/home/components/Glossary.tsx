import { Heading } from "~/components/ui/Heading";

import { FAQItem } from "./FaqItem";

export const Glossary = (): JSX.Element => (
  <div className="mt-14 flex flex-col items-center justify-center sm:mt-28 dark:text-white" id="Glossary">
    <Heading size="6xl">Glossary</Heading>

    <FAQItem
      description="An individual or team submitting a proposal for voting. Applicants aim to attract voter support by showcasing benefits."
      title="Applicant"
    />

    <FAQItem
      description="It's the option, candidate, idea, or project which the applicants submit for voting."
      title="Proposal"
    />

    <FAQItem
      description="Members who allocate their voting power (often through credits or tokens) to support proposals."
      title="Voters"
    />

    <FAQItem
      description="The Coordinator is responsible for deploying the MACI smart contracts, initiating polls, tallying the final results of a vote, and finalizing polls by publishing the final results on-chain."
      title="Coordinator"
    />

    <FAQItem
      description="The team or entity responsible for managing the funding round. Organizers define rules, oversee phases, verify applicant eligibility, and ensure transparency throughout the process."
      title="Organizers"
    />

    <FAQItem
      description="It's a community-driven funding method where matching funds are distributed based on the number of contributors and the amounts donated. It amplifies projects with broad support by prioritizing many small contributions over a few large ones, ensuring fair and democratic allocation of resources."
      title="Quadratic Funding"
    />

    <FAQItem
      description="During this phase, applicants submit their proposals, including detailed descriptions, goals, and potential impact. Organizers review and approve submissions to ensure they meet the round criteria."
      title="Application Phase"
    />

    <FAQItem
      description="Voters review the approved proposals and allocate their voting power to the projects they support."
      title="Voting Phase"
    />

    <FAQItem
      description="The Coordinator processes all the messages, tallies the results and publishes the proofs on-chain."
      title="Tallying Phase"
    />

    <FAQItem description="The final distribution of votes is announced." title="Results Phase" />

    <FAQItem
      description="Voting power refers to the resources or credits a voter has to cast votes. It acts as a budget that determines how much influence a voter can exert on the outcome by supporting specific proposal."
      title="Voting Power"
    />

    <FAQItem
      description="Effective Votes represent the weighted impact of the credits spent after applying quadratic calculations, for example if a voter spends 16 credits on one project, the Effective Votes contributed will be 4. Effective votes reflect both individual contributions and collective support, ensuring small contributions from many voters have more influence than large contributions from a few."
      title="Effective Votes"
    />

    <FAQItem
      description="A conceptual grouping of proposals a voter choose and allocate their votes, allowing comparison and prioritization before submitting their votes."
      title="Ballot"
    />
  </div>
);

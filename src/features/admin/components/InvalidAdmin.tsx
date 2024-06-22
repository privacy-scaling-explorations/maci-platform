import { Heading } from "~/components/ui/Heading";

export const InvalidAdmin = (): JSX.Element => (
  <div>
    <Heading as="h3" size="2xl">
      Invalid Admin Account
    </Heading>

    <p>Only admins can access this page.</p>
  </div>
);

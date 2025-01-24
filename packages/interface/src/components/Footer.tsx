import Image from "next/image";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { config } from "~/config";
import { useIsMobile } from "~/hooks/useIsMobile";

import { Logo } from "./ui/Logo";

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL!;

export const Footer = (): JSX.Element => {
  const isMobile = useIsMobile();

  return (
    <footer className="dark:border-lighterBlack flex flex-col items-center justify-between gap-4 border-t border-gray-300 bg-gray-50 px-2 py-4 sm:flex-row sm:px-12 sm:py-9 dark:bg-black dark:text-white">
      <div className="flex items-center justify-start gap-8 sm:gap-4">
        <a aria-label="twitter" href="https://x.com/zkMACI" rel="noreferrer" target="_blank">
          <FaXTwitter />
        </a>

        <a
          aria-label="github"
          href="https://github.com/privacy-scaling-explorations/maci-platform/"
          rel="noreferrer"
          target="_blank"
        >
          <FaGithub />
        </a>

        <a aria-label="discord" href="https://discord.com/invite/sF5CT5rzrR" rel="noreferrer" target="_blank">
          <FaDiscord />
        </a>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 sm:flex-row">
        <p className="text-red flex items-center">Git Version: {config.commitHash}</p>

        <a className="flex items-center justify-center sm:gap-1" href={feedbackUrl} rel="noreferrer" target="_blank">
          <span>{isMobile ? "Share your feedback" : "Feedback"}</span>

          <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
        </a>

        <a
          className="flex items-center justify-center sm:gap-1"
          href="https://maci.pse.dev/docs/introduction"
          rel="noreferrer"
          target="_blank"
        >
          <span>{isMobile ? "Documentation" : "Docs"}</span>

          <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
        </a>

        <a
          className="flex items-center justify-center sm:gap-1"
          href="https://maci.pse.dev"
          rel="noreferrer"
          target="_blank"
        >
          <span>{isMobile ? "About MACI Platform" : "About"}</span>

          <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
        </a>

        <Logo />
      </div>
    </footer>
  );
};

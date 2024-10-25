import Image from "next/image";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { Logo } from "./ui/Logo";

export const Footer = (): JSX.Element => (
  <footer className="dark:border-lighterBlack flex items-center justify-between border-t border-gray-300 bg-gray-50 px-12 py-9 dark:bg-black dark:text-white">
    <div className="flex items-center justify-start gap-4">
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

    <div className="flex justify-end gap-4">
      <a className="flex items-center gap-1" href="https://maci.pse.dev" rel="noreferrer" target="_blank">
        <span>Docs</span>

        <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
      </a>

      <a className="flex items-center gap-1" href="https://maci.pse.dev" rel="noreferrer" target="_blank">
        <span>About</span>

        <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
      </a>

      <Logo />
    </div>
  </footer>
);

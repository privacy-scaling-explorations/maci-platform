import Image from "next/image";
import { FaTelegramPlane, FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { Logo } from "./ui/Logo";

export const Footer = (): JSX.Element => (
  <footer className="flex items-center justify-between border-t border-gray-300 bg-gray-50 px-12 py-9">
    <div className="flex items-center justify-start gap-4">
      <a aria-label="twitter" href="https://x.com/zkMACI" rel="noreferrer" target="_blank">
        <FaXTwitter />
      </a>

      <a aria-label="telegram" href="https://telegram.com" rel="noreferrer" target="_blank">
        <FaTelegramPlane />
      </a>

      <a
        aria-label="github"
        href="https://github.com/privacy-scaling-explorations/maci-rpgf/"
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
        <span>Documentation</span>

        <Image alt="arrow-go-to" height="18" src="/arrow-go-to.svg" width="18" />
      </a>

      <a className="flex items-center gap-1" href="https://maci.pse.dev" rel="noreferrer" target="_blank">
        <span>About MACI-RPGF</span>

        <Image alt="arrow-go-to" height="18" src="/arrow-go-to.svg" width="18" />
      </a>

      <Logo />
    </div>
  </footer>
);

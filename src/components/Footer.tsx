import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane, FaGithub, FaDiscord } from "react-icons/fa";
import Image from "next/image";

import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-gray-300 bg-gray-50 px-12 py-9">
      <div className="flex items-center justify-start gap-4">
        <a href={"https://x.com/zkMACI"} target="_blank">
          <FaXTwitter />
        </a>
        <a href={"https://telegram.com"} target="_blank">
          <FaTelegramPlane />
        </a>
        <a
          href={"https://github.com/privacy-scaling-explorations/maci-rpgf/"}
          target="_blank"
        >
          <FaGithub />
        </a>
        <a href={"https://discord.com/invite/sF5CT5rzrR"} target="_blank">
          <FaDiscord />
        </a>
      </div>
      <div className="flex justify-end gap-4">
        <a
          href={"https://maci.pse.dev"}
          target="_blank"
          className="flex items-center gap-1"
        >
          <span>Documentation</span>
          <Image alt="" width="18" height="18" src={"/arrow-go-to.svg"} />
        </a>
        <a
          href={"https://maci.pse.dev"}
          target="_blank"
          className="flex items-center gap-1"
        >
          <span>About MACI-RPGF</span>
          <Image alt="" width="18" height="18" src={"/arrow-go-to.svg"} />
        </a>
        <Logo />
      </div>
    </footer>
  );
}

import dynamic from "next/dynamic";
import Image from "next/image";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { AppContainer } from "~/layouts/AppContainer";

import { Logo } from "./ui/Logo";

const feedbackUrl = process.env.NEXT_PUBLIC_FEEDBACK_URL!;

const FooterNavLink = ({
  href,
  children,
  showExternalIcon = true,
  isExternal = true,
  ariaLabel = "",
}: {
  href: string;
  children: React.ReactNode;
  showExternalIcon?: boolean;
  isExternal?: boolean;
  ariaLabel?: string;
}): JSX.Element => (
  <a
    aria-label={ariaLabel}
    className="flex items-center justify-center gap-1 font-sans text-base font-medium text-black duration-200 hover:opacity-50 dark:text-white"
    href={href}
    rel={isExternal ? "noreferrer" : undefined}
    target={isExternal ? "_blank" : undefined}
  >
    {children}

    {showExternalIcon && (
      <Image alt="arrow-go-to" className="dark:invert" height="18" src="/arrow-go-to.svg" width="18" />
    )}
  </a>
);

const Footer = (): JSX.Element => (
  <footer className="dark:border-lighterBlack border-t border-gray-200 bg-gray-50 dark:bg-black dark:text-white">
    <AppContainer className="flex flex-col items-center justify-between gap-4 py-12 md:flex-row md:py-9">
      <div className="flex items-center justify-start gap-6 md:gap-4">
        <FooterNavLink ariaLabel="twitter" href="https://x.com/zkMACI" showExternalIcon={false}>
          <FaXTwitter size={20} />
        </FooterNavLink>

        <FooterNavLink
          ariaLabel="github"
          href="https://github.com/privacy-scaling-explorations/maci-platform/"
          showExternalIcon={false}
        >
          <FaGithub size={20} />
        </FooterNavLink>

        <FooterNavLink ariaLabel="discord" href="https://discord.com/invite/sF5CT5rzrR" showExternalIcon={false}>
          <FaDiscord size={23} />
        </FooterNavLink>
      </div>

      <div className="flex flex-col items-center justify-end gap-10 md:flex-row md:gap-6">
        <FooterNavLink href={feedbackUrl}>Share your feedback</FooterNavLink>

        <FooterNavLink href="https://maci.pse.dev/docs/introduction">Documentation</FooterNavLink>

        <FooterNavLink href="https://maci.pse.dev">About MACI PLATFORM</FooterNavLink>

        <Logo />
      </div>
    </AppContainer>
  </footer>
);

export default dynamic(async () => Promise.resolve(Footer), { ssr: false });

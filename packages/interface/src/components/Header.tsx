import clsx from "clsx";
import { Menu, X, SunIcon, MoonIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { type ComponentPropsWithRef, useState, useCallback, useMemo } from "react";

import { useBallot } from "~/contexts/Ballot";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import ConnectButton from "./ConnectButton";
import { IconButton } from "./ui/Button";
import { Logo } from "./ui/Logo";

interface INavLinkProps extends ComponentPropsWithRef<typeof Link> {
  isActive: boolean;
}

const NavLink = ({ isActive, ...props }: INavLinkProps) => (
  <Link
    className={clsx(
      "flex h-full items-center p-4 font-sans hover:font-extrabold",
      isActive && "border-b-2 border-blue-400",
    )}
    {...props}
  />
);

interface IMobileMenuProps {
  isOpen?: boolean;
  navLinks: INavLink[];
}

const MobileMenu = ({ isOpen = false, navLinks }: IMobileMenuProps) => (
  <div
    className={clsx("fixed left-0 top-16 z-10 h-full w-full bg-white transition-transform duration-150", {
      "-translate-x-full": !isOpen,
    })}
  >
    <Link key="home" className={clsx("block p-4 text-2xl  font-semibold")} href="/">
      Home
    </Link>

    {navLinks.map((link) => (
      <Link key={link.href} className={clsx("block p-4 text-2xl  font-semibold")} {...link} />
    ))}
  </div>
);

interface INavLink {
  href: string;
  children: string;
}

interface IHeaderProps {
  navLinks: INavLink[];
  pollId?: string;
}

const Header = ({ navLinks, pollId = "" }: IHeaderProps) => {
  const { asPath } = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { getBallot } = useBallot();
  const roundState = useRoundState({ pollId });
  const { theme, setTheme } = useTheme();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const handleChangeTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // the URI of round index page looks like: /rounds/:pollId, without anything else, which is the reason why the length is 3
  const isRoundIndexPage = useMemo(() => asPath.includes("rounds") && asPath.split("/").length === 3, [asPath]);

  return (
    <header className="dark:border-lighterBlack dark:bg-lightBlack relative z-[100] border-b border-gray-200 bg-white dark:text-white">
      <div className="container mx-auto flex h-[72px] max-w-screen-2xl items-center px-2">
        <div className="mr-4 flex items-center md:mr-16">
          <IconButton
            className="mr-1 text-gray-600 md:hidden"
            icon={isOpen ? X : Menu}
            variant="ghost"
            onClick={() => {
              setOpen(!isOpen);
            }}
          />

          <Link className="py-4" href="/">
            <Logo />
          </Link>
        </div>

        <div className="hidden h-full items-center gap-4 overflow-x-auto uppercase md:flex">
          {navLinks.map((link) => {
            const isActive =
              asPath.includes(link.children.toLowerCase()) || (link.children === "Projects" && isRoundIndexPage);

            return (
              <NavLink key={link.href} href={link.href} isActive={isActive}>
                {link.children}

                {roundState === ERoundState.VOTING && link.href.includes("/ballot") && ballot.votes.length > 0 && (
                  <div className="ml-2 h-5 w-5 rounded-full border-2 border-blue-400 bg-blue-50 text-center text-sm leading-4 text-blue-400">
                    {ballot.votes.length}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex-1 md:ml-8" />

        <div className="ml-4 flex items-center gap-4 md:ml-8 xl:ml-32">
          <IconButton
            className="text-gray-600"
            icon={theme === "light" ? SunIcon : MoonIcon}
            variant="ghost"
            onClick={handleChangeTheme}
          />

          <ConnectButton showMobile={false} />
        </div>

        <MobileMenu isOpen={isOpen} navLinks={navLinks} />
      </div>
    </header>
  );
};

export default dynamic(async () => Promise.resolve(Header), { ssr: false });

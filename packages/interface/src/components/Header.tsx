import { Menu, MoonIcon, SunIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { type ComponentPropsWithRef, useState, useMemo, useEffect, useCallback } from "react";

import { useBallot } from "~/contexts/Ballot";
import { AppContainer } from "~/layouts/AppContainer";
import { cn } from "~/utils/classNames";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import ConnectButton from "./ConnectButton";
import { HelpButton } from "./HelpButton";
import { IconButton } from "./ui/Button";
import { Logo } from "./ui/Logo";

interface INavLinkProps extends ComponentPropsWithRef<typeof Link> {
  isActive: boolean;
}

const NavLink = ({ isActive, ...props }: INavLinkProps) => (
  <Link className={cn("relative flex h-full w-full min-w-[95px] flex-col items-center")} {...props}>
    <span className="p-2 font-sans text-sm font-medium leading-5">{props.children}</span>

    <div className={cn("absolute bottom-0 h-[2px] w-full bg-blue-400", isActive ? "opacity-100" : "opacity-0")} />
  </Link>
);

interface IMobileMenuProps {
  isOpen?: boolean;
  navLinks: INavLink[];
  pollId: string;
  setOpen: (open: boolean) => void;
}

const MobileMenu = ({ isOpen = false, navLinks, pollId, setOpen }: IMobileMenuProps) => {
  const { getBallot } = useBallot();
  const roundState = useRoundState({ pollId });
  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  return (
    <div
      className={cn("fixed left-0 top-16 z-10 h-full w-full bg-white transition-transform duration-150", {
        "-translate-x-full": !isOpen,
      })}
    >
      <Link
        key="home"
        className={cn("block p-4 text-2xl  font-semibold")}
        href="/"
        onClick={() => {
          setOpen(false);
        }}
      >
        Home
      </Link>

      {navLinks.map((link) => (
        <Link
          key={link.href}
          className={cn("block p-4 text-2xl font-semibold uppercase  text-black dark:text-white")}
          href={link.href}
          onClick={() => {
            setOpen(false);
          }}
        >
          {link.name}

          {roundState === ERoundState.VOTING && link.href.includes("/ballot") && ballot.votes.length > 0 && (
            <div className="ml-2 h-5 w-5 rounded-full bg-blue-50 font-sans text-sm font-medium leading-5 text-blue-400">
              {ballot.votes.length}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

interface INavLink {
  label: string;
  href: string;
  name: string;
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

  // set default theme to light if it's not set
  useEffect(() => {
    const defaultTheme = theme === "dark" ? "dark" : "light";
    if (!["dark", "light"].includes(theme ?? "")) {
      setTheme(defaultTheme);
    }
  }, []);

  const handleChangeTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  // the URI of round index page looks like: /rounds/:pollId, without anything else, which is the reason why the length is 3
  const isRoundIndexPage = useMemo(
    () => asPath.includes("rounds") && !asPath.includes("proposals") && !asPath.includes("ballot"),
    [asPath],
  );

  return (
    <header className="dark:border-lighterBlack dark:bg-lightBlack relative z-[100] border-b border-gray-200 bg-white py-[18px] dark:text-white">
      <AppContainer as="div" className="container mx-auto flex items-center px-2">
        <div className="mr-4 flex items-center md:mr-16">
          <IconButton
            className="mr-1 text-gray-600 md:hidden"
            icon={isOpen ? X : Menu}
            variant="ghost"
            onClick={() => {
              setOpen(!isOpen);
            }}
          />

          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="hidden h-full items-center gap-[36px] overflow-x-auto uppercase md:flex">
          {navLinks.map((link) => {
            const isActive =
              (link.label !== "round" && asPath.includes(link.label)) || (link.label === "round" && isRoundIndexPage);

            return (
              <NavLink key={link.label} href={link.href} isActive={isActive}>
                {link.name}

                {roundState === ERoundState.VOTING && link.href.includes("/ballot") && ballot.votes.length > 0 && (
                  <div className="ml-2 h-5 w-5 rounded-full bg-blue-50 font-sans text-sm font-medium leading-5 text-blue-400">
                    {ballot.votes.length}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex-1 md:ml-8" />

        <div className="flex items-center gap-2">
          <HelpButton />

          <IconButton
            className="w-[50px] text-gray-600"
            icon={theme === "light" ? SunIcon : MoonIcon}
            variant="ghost"
            onClick={handleChangeTheme}
          />

          <ConnectButton showMobile={false} />
        </div>

        <MobileMenu isOpen={isOpen} navLinks={navLinks} pollId={pollId} setOpen={setOpen} />
      </AppContainer>
    </header>
  );
};

export default dynamic(async () => Promise.resolve(Header), { ssr: false });

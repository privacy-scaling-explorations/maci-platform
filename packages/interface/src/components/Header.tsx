import { usePrivy } from "@privy-io/react-auth";
import clsx from "clsx";
import { Menu, X, SunIcon, MoonIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { type ComponentPropsWithRef, useState, useCallback, useMemo, useEffect } from "react";
import { useAccount as wagmiUseAccount } from "wagmi";

import { useAccountType } from "~/contexts/AccountType";
import { useBallot } from "~/contexts/Ballot";
import useAccount from "~/hooks/useAccount";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import ConnectButton from "./ConnectButton";
import { HelpButton } from "./HelpButton";
import SignInButton from "./SignInButton";
import SignUpButton from "./SignUpButton";
import { Button, IconButton } from "./ui/Button";
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
  const { isConnected, address } = useAccount();
  const { authenticated, logout } = usePrivy();
  const { accountType, storeAccountType } = useAccountType();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const { isConnected: extensionAuthenticated } = wagmiUseAccount();
  const embeddedAuthenticated = authenticated;
  const extensionConnected = accountType === "extension" && isConnected && extensionAuthenticated;
  const embeddedConnected = accountType === "embedded" && isConnected && embeddedAuthenticated;

  const handleLogout = () => {
    logout();
    storeAccountType("none");
  };

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
              (link.label !== "round" && asPath.includes(link.label)) || (link.label === "round" && isRoundIndexPage);

            return (
              <NavLink key={link.label} href={link.href} isActive={isActive}>
                {link.name}

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

        <div className="ml-4 flex items-center gap-2 md:ml-8 xl:ml-32">
          <HelpButton />

          <IconButton
            className="w-[50px] text-gray-600"
            icon={theme === "light" ? SunIcon : MoonIcon}
            variant="ghost"
            onClick={handleChangeTheme}
          />

          {!extensionConnected && !embeddedConnected && (
            <div className="flex items-center gap-4">
              <SignInButton showMessage={false} showMobile={false} />

              <SignUpButton showMessage={false} showMobile={false} />
            </div>
          )}

          {extensionConnected && <ConnectButton showMobile={false} />}

          {embeddedConnected && <Button onClick={handleLogout}>Logout: {address}</Button>}
        </div>

        <MobileMenu isOpen={isOpen} navLinks={navLinks} />
      </div>
    </header>
  );
};

export default dynamic(async () => Promise.resolve(Header), { ssr: false });

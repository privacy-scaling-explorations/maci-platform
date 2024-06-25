import Link from "next/link";
import { useRouter } from "next/router";
import { type ComponentPropsWithRef, useState } from "react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

import { ConnectButton } from "./ConnectButton";
import { IconButton } from "./ui/Button";
import { Logo } from "./ui/Logo";
import { useBallot } from "~/contexts/Ballot";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const NavLink = ({ isActive, ...props }: { isActive: boolean } & ComponentPropsWithRef<typeof Link>) => (
  <Link
    className={clsx(
      "flex h-full items-center p-4 font-sans hover:font-extrabold",
      isActive && "border-b-2 border-blue-400",
    )}
    {...props}
  />
);

const MobileMenu = ({ isOpen = false, navLinks }: { isOpen?: boolean; navLinks: INavLink[] }) => (
  <div
    className={clsx(
      "fixed left-0 top-16 z-10 h-full w-full bg-white transition-transform duration-150 dark:bg-gray-900",
      {
        "translate-x-full": !isOpen,
      },
    )}
  >
    {navLinks.map((link) => (
      <Link key={link.href} className={clsx("block p-4 text-2xl  font-semibold")} {...link} />
    ))}
  </div>
);

interface INavLink {
  href: string;
  children: string;
}

const Header = ({ navLinks }: { navLinks: INavLink[] }) => {
  const { asPath } = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { ballot } = useBallot();
  const appState = useAppState();

  return (
    <header className="relative z-[100] border-b border-gray-200 bg-white">
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
          {navLinks?.map((link) => {
            const pageName = `/${link.href.split("/")[1]}`;
            return (
              <NavLink
                isActive={asPath.startsWith(pageName)}
                key={link.href}
                href={link.href}
              >
                {link.children}
                {appState === EAppState.VOTING &&
                  pageName === "/ballot" &&
                  ballot &&
                  ballot.votes.length > 0 && (
                    <div className="ml-2 h-5 w-5 rounded-full border-2 border-blue-400 bg-blue-50 text-center text-sm leading-4 text-blue-400">
                      {ballot.votes.length}
                    </div>
                  )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex-1 md:ml-8" />

        <div className="ml-4 flex gap-4 md:ml-8 xl:ml-32">
          <ConnectButton />
        </div>

        <MobileMenu isOpen={isOpen} navLinks={navLinks} />
      </div>
    </header>
  );
};

export default dynamic(async () => Promise.resolve(Header), { ssr: false });

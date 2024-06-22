import clsx from "clsx";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ComponentPropsWithRef, useState } from "react";

import { config, metadata } from "~/config";

import { ConnectButton } from "./ConnectButton";
import { IconButton } from "./ui/Button";

const Logo = () => (
  <div className="h-10">
    {config.logoUrl ? (
      <Image alt="logo" className="max-h-full" src={config.logoUrl} />
    ) : (
      <div className="flex h-full items-center justify-center rounded-full border-2 border-dashed border-white px-4 text-xs font-medium tracking-wider text-white">
        {metadata.title}
      </div>
    )}
  </div>
);

const NavLink = ({ isActive, ...props }: { isActive: boolean } & ComponentPropsWithRef<typeof Link>) => (
  <Link
    className={clsx(
      "flex h-full items-center border-b-[3px] border-transparent p-4 font-semibold text-gray-400 hover:text-white",
      {
        "!border-white  !text-white": isActive,
      },
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

  return (
    <header className="relative z-[100] bg-gray-900 shadow-md dark:shadow-none">
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

        <div className="hidden h-full items-center gap-4 overflow-x-auto md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} isActive={asPath.startsWith(link.href)}>
              {link.children}
            </NavLink>
          ))}
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

import clsx from "clsx";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { type ReactNode, type PropsWithChildren, createContext, useContext, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";

import { metadata } from "~/config";

const Context = createContext({ eligibilityCheck: false, showBallot: false });

export const useLayoutOptions = (): { eligibilityCheck: boolean; showBallot: boolean } => useContext(Context);

const Sidebar = ({ side = undefined, ...props }: { side?: "left" | "right" } & PropsWithChildren) => (
  <div>
    <div
      className={clsx("px-2 md:w-[336px] md:px-4", {
        "left-0 top-[2rem] md:sticky": side === "left",
      })}
      {...props}
    />
  </div>
);

export interface LayoutProps {
  title?: string;
  requireAuth?: boolean;
  eligibilityCheck?: boolean;
  showBallot?: boolean;
}

export const BaseLayout = ({
  header = null,
  title = "",
  sidebar = undefined,
  sidebarComponent = null,
  requireAuth = false,
  eligibilityCheck = false,
  showBallot = false,
  children = null,
}: PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
    header?: ReactNode;
  } & LayoutProps
>): JSX.Element => {
  const { theme } = useTheme();
  const router = useRouter();
  const { address, isConnecting } = useAccount();

  useEffect(() => {
    if (requireAuth && !address && !isConnecting) {
      router.push("/");
    }
  }, [requireAuth, address, isConnecting, router]);

  const wrappedSidebar = <Sidebar side={sidebar}>{sidebarComponent}</Sidebar>;

  const contextValue = useMemo(() => ({ eligibilityCheck, showBallot }), [eligibilityCheck, showBallot]);

  return (
    <Context.Provider value={contextValue}>
      <Head>
        <title>{title ? `${title} - ${metadata.title}` : metadata.title}</title>

        <meta content={metadata.description} name="description" />

        <link href="favicon.svg" rel="icon" />

        <meta content={metadata.url} property="og:url" />

        <meta content="website" property="og:type" />

        <meta content={title} property="og:title" />

        <meta content={metadata.description} property="og:description" />

        <meta content={metadata.image} property="og:image" />

        <meta content="summary_large_image" name="twitter:card" />

        <meta content="https://github.com/privacy-scaling-explorations/maci-rpgf" property="twitter:domain" />

        <meta content={metadata.url} property="twitter:url" />

        <meta content={title} name="twitter:title" />

        <meta content={metadata.description} name="twitter:description" />

        <meta content={metadata.image} name="twitter:image" />
      </Head>

      <div className={clsx(" flex h-full min-h-screen flex-1 flex-col text-[#222133] dark:bg-[#B6CDEC]", theme)}>
        {header}

        <div className="mx-auto w-full flex-1 pt-12 2xl:container md:flex">
          {sidebar === "left" ? wrappedSidebar : null}

          <div
            className={clsx("w-full min-w-0 px-2 pb-24", {
              "mx-auto max-w-5xl": !sidebar,
            })}
          >
            {children}
          </div>

          {sidebar === "right" ? wrappedSidebar : null}
        </div>

      </div>
    </Context.Provider>
  );
};

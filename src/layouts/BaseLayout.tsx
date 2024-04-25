import clsx from "clsx";
import Head from "next/head";
import {
  type ReactNode,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";
import { useAccount } from "wagmi";

import { useRouter } from "next/router";
import { metadata } from "~/config";
import { useTheme } from "next-themes";
import { Footer } from "~/components/Footer";

const Context = createContext({ eligibilityCheck: false, showBallot: false });
export const useLayoutOptions = () => useContext(Context);

export type LayoutProps = {
  title?: string;
  requireAuth?: boolean;
  eligibilityCheck?: boolean;
  showBallot?: boolean;
};
export const BaseLayout = ({
  header,
  title,
  sidebar,
  sidebarComponent,
  requireAuth,
  eligibilityCheck = false,
  showBallot = false,
  children,
}: PropsWithChildren<
  {
    sidebar?: "left" | "right";
    sidebarComponent?: ReactNode;
    header?: ReactNode;
  } & LayoutProps
>) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { address, isConnecting } = useAccount();

  useEffect(() => {
    if (requireAuth && !address && !isConnecting) {
      void router.push("/");
    }
  }, [requireAuth, address, isConnecting, router]);

  const wrappedSidebar = <Sidebar side={sidebar}>{sidebarComponent}</Sidebar>;

  title = title ? `${title} - ${metadata.title}` : metadata.title;
  return (
    <Context.Provider value={{ eligibilityCheck, showBallot }}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="favicon.svg" />npm
        <meta property="og:url" content={metadata.url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="https://github.com/privacy-scaling-explorations/maci-rpgf"
        />
        <meta property="twitter:url" content={metadata.url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />

        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Ojuju:wght@200..800&display=swap" rel="stylesheet"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Ojuju:wght@200..800&display=swap" rel="stylesheet"/>
      
      </Head>
      <div
        className={clsx(
          " flex h-full min-h-screen flex-1 flex-col dark:bg-PGFBeige",
          theme,
        )}
      >
        {header}
        <div className="mx-auto w-full flex-1 pt-12 2xl:container md:flex">
          {sidebar === "left" ? wrappedSidebar : null}
          <div
            className={clsx("w-full min-w-0 px-2", {
              ["mx-auto max-w-5xl"]: !sidebar,
            })}
          >
            {children}
          </div>
          {sidebar === "right" ? wrappedSidebar : null}
        </div>
        <Footer />
      </div>
    </Context.Provider>
  );
};

const Sidebar = ({
  side,
  ...props
}: { side?: "left" | "right" } & PropsWithChildren) => (
  <div>
    <div
      className={clsx("px-2 md:w-[336px] md:px-4", {
        ["left-0 top-[2rem] md:sticky"]: side === "left",
      })}
      {...props}
    />
  </div>
);

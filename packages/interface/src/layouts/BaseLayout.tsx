import clsx from "clsx";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import {
  type ReactNode,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { tv } from "tailwind-variants";
import { useAccount } from "wagmi";

import { Footer } from "~/components/Footer";
import { createComponent } from "~/components/ui";
import { metadata } from "~/config";
import { useMaci } from "~/contexts/Maci";

const Context = createContext({ eligibilityCheck: false, showBallot: false });

const MainContainer = createComponent(
  "div",
  tv({
    base: "w-screen flex-1 md:flex",
    variants: {
      type: {
        default: "mt-12 pl-2 pr-6",
        home: "mt-0 pl-0 pr-0",
      },
    },
    defaultVariants: {
      type: "default",
    },
  }),
);

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
  requireRegistration?: boolean;
  eligibilityCheck?: boolean;
  showBallot?: boolean;
  type?: string;
}

export const BaseLayout = ({
  header = null,
  title = "",
  sidebar = undefined,
  sidebarComponent = null,
  requireAuth = false,
  requireRegistration = false,
  eligibilityCheck = false,
  showBallot = false,
  type = undefined,
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
  const { isRegistered } = useMaci();

  const manageDisplay = useCallback(() => {
    if ((requireAuth && !address && !isConnecting) || (requireRegistration && !isRegistered)) {
      router.push("/");
    }
  }, [requireAuth, address, isConnecting, requireRegistration, isRegistered, router]);

  useEffect(() => {
    manageDisplay();
  }, [manageDisplay]);

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

        <meta content="https://github.com/privacy-scaling-explorations/maci-platform" property="twitter:domain" />

        <meta content={metadata.url} property="twitter:url" />

        <meta content={title} name="twitter:title" />

        <meta content={metadata.description} name="twitter:description" />

        <meta content={metadata.image} name="twitter:image" />
      </Head>

      <div className={clsx("flex h-full min-h-screen flex-1 flex-col bg-white dark:bg-black", theme)}>
        {header}

        <MainContainer type={type}>
          {sidebar === "left" ? wrappedSidebar : null}

          <div className="w-full pb-24">{children}</div>

          {sidebar === "right" ? wrappedSidebar : null}
        </MainContainer>

        <Footer />
      </div>
    </Context.Provider>
  );
};

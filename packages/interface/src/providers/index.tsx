import { PrivyProvider } from "@privy-io/react-auth";
import { type Chain, getDefaultConfig, RainbowKitProvider, type Theme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useMemo, type PropsWithChildren } from "react";
import { http, WagmiProvider } from "wagmi";

import { Toaster } from "~/components/Toaster";
import * as appConfig from "~/config";
import { AccountProvider } from "~/contexts/Account";
import { BallotProvider } from "~/contexts/Ballot";
import { MaciProvider } from "~/contexts/Maci";
import { RoundProvider } from "~/contexts/Round";

const theme = lightTheme();

const customTheme: Theme = {
  blurs: {
    ...theme.blurs,
  },
  colors: {
    ...theme.colors,
  },
  fonts: {
    body: "Share Tech Mono",
  },
  radii: {
    ...theme.radii,
  },
  shadows: {
    ...theme.shadows,
  },
};

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
}
const privyId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export const Providers = ({ children }: PropsWithChildren): JSX.Element => {
  const { config, queryClient } = useMemo(() => createWagmiConfig(), []);

  return (
    <ThemeProvider attribute="class" forcedTheme={appConfig.theme.colorMode}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <PrivyProvider
            appId={privyId}
            config={{
              // Customize Privy's appearance in your app
              appearance: {
                theme: "light",
                accentColor: "#676FFF",
                logo: "/round-logo.svg",
                loginMessage: "Welcome to MACI Platform",
                landingHeader: "MACI Platform",
              },
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                createOnLogin: "users-without-wallets",
              },
            }}
          >
            <RainbowKitProvider theme={customTheme}>
              <RoundProvider>
                <AccountProvider>
                  <MaciProvider>
                    <BallotProvider>{children}</BallotProvider>

                    <Toaster />
                  </MaciProvider>
                </AccountProvider>
              </RoundProvider>
            </RainbowKitProvider>
          </PrivyProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

function createWagmiConfig() {
  const activeChains: Chain[] = [appConfig.config.network];

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID!;
  const appName = appConfig.metadata.title;

  const queryClient = new QueryClient();

  const config = getDefaultConfig({
    appName,
    projectId,
    ssr: true,
    chains: activeChains as unknown as readonly [Chain, ...Chain[]],
    transports: {
      [appConfig.config.network.id]: http(appConfig.getRPCURL()),
    },
  });

  return { config, queryClient };
}

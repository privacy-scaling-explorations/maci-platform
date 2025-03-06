import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
// eslint-disable-next-line import/no-extraneous-dependencies
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { type Chain, RainbowKitProvider, type Theme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useMemo, type PropsWithChildren } from "react";
import { Transport } from "viem";
import { Config, http } from "wagmi";

import { Toaster } from "~/components/Toaster";
import * as appConfig from "~/config";
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

export const Providers = ({ children }: PropsWithChildren): JSX.Element => {
  const { wagmiConfig, queryClient } = useMemo(() => createWagmiConfig(), []);
  const { privyId, privyConfig } = useMemo(() => createPrivyConfig(), []);

  return (
    <ThemeProvider attribute="class" forcedTheme={appConfig.theme.colorMode}>
      <PrivyProvider appId={privyId} config={privyConfig}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider theme={customTheme}>
              <RoundProvider>
                <MaciProvider>
                  <BallotProvider>{children}</BallotProvider>

                  <Toaster />
                </MaciProvider>
              </RoundProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
};

function createWagmiConfig() {
  const activeChains: Chain[] = [appConfig.config.network];
  const queryClient = new QueryClient();

  type WagmiConfig = Config<readonly [Chain, ...Chain[]], Record<number, Transport>>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const config = createConfig({
    chains: activeChains as [Chain, ...Chain[]],
    transports: {
      [appConfig.config.network.id]: http(appConfig.getRPCURL()),
    },
  });
  const wagmiConfig = config as unknown as WagmiConfig;

  return { wagmiConfig, queryClient };
}

function createPrivyConfig() {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }
  const privyId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const activeChains: Chain[] = [appConfig.config.network];

  const privyConfig: PrivyClientConfig = {
    appearance: {
      theme: "light" as const,
      accentColor: "#676FFF" as const,
      logo: "/round-logo.svg",
      loginMessage: "Welcome to MACI Platform",
      landingHeader: "MACI Platform",
      showWalletLoginFirst: true,
    },
    supportedChains: activeChains as [Chain, ...Chain[]],
    embeddedWallets: {
      createOnLogin: "users-without-wallets" as const,
      requireUserPasswordOnCreate: true,
      showWalletUIs: true,
    },
    loginMethods: ["email", "wallet"],
  };

  return { privyId, privyConfig };
}

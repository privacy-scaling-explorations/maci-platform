import { type Chain, getDefaultConfig, RainbowKitProvider, type Theme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useMemo, type PropsWithChildren } from "react";
import { http, WagmiProvider } from "wagmi";

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
  const { config, queryClient } = useMemo(() => createWagmiConfig(), []);

  return (
    <ThemeProvider attribute="class" forcedTheme={appConfig.theme.colorMode}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={customTheme}>
            <RoundProvider>
              <MaciProvider>
                <BallotProvider>{children}</BallotProvider>

                <Toaster />
              </MaciProvider>
            </RoundProvider>
          </RainbowKitProvider>
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
    ssr: false,
    chains: activeChains as unknown as readonly [Chain, ...Chain[]],
    transports: {
      [appConfig.config.network.id]: http(appConfig.getRPCURL()),
    },
  });

  return { config, queryClient };
}

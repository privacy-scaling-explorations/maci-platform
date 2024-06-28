declare module "@synthetixio/synpress/helpers" {
  export function prepareMetamask(version: string): Promise<string>;
}

declare module "@synthetixio/synpress/commands/metamask" {
  export interface ChainConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    symbol: string;
  }

  export async function initialSetup(
    browser: import("@playwright/test").BrowserType,
    options: {
      secretWordsOrPrivateKey: string;
      network: string | ChainConfig;
      password: string;
      enableAdvancedSettings: boolean;
    },
  ): Promise<void>;

  export async function acceptAccess(): Promise<void>;

  export async function confirmSignatureRequest(): Promise<void>;
}

declare module "@synthetixio/synpress/commands/playwright" {
  export async function init(browser: import("@playwright/test").Browser | null): Promise<void>;

  export async function setExpectInstance(expect: import("@playwright/test").Expect): Promise<void>;
}

declare module "@synthetixio/synpress/commands/synpress" {
  export async function resetState(): Promise<void>;
}

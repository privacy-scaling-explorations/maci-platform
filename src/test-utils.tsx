import { type RenderOptions, render, RenderResult } from "@testing-library/react";
import { httpLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import React, { type PropsWithChildren, type ReactElement } from "react";
import superjson from "superjson";

import type { DataTransformerOptions } from "@trpc/server/unstable-core-do-not-import";

import { Providers } from "./providers";
import { type AppRouter } from "./server/api/root";

const AllTheProviders = ({ children }: PropsWithChildren) => <Providers>{children}</Providers>;

const mockApi = createTRPCNext<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  config() {
    return {
      transformer: superjson,
      links: [
        httpLink({
          url: `http://localhost:3000/api/trpc`,
          headers: () => ({ "Content-Type": "application/json" }),
          transformer: undefined as unknown as DataTransformerOptions,
        }),
      ],
    };
  },
  ssr: false,
});

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderResult =>
  render(ui, { wrapper: mockApi.withTRPC(AllTheProviders), ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

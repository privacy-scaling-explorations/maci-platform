import "@testing-library/jest-dom";
import "dotenv/config";
import { afterAll, beforeAll, vi } from "vitest";

import { server } from "./test-msw";

beforeAll(() => {
  /* eslint-disable-next-line */
  vi.mock("next/router", () => require("next-router-mock"));
});

afterAll(() => {
  server.close();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: unknown) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { createBreakpoint } from "react-use";

import { EBreakpointSizes } from "~/utils/types";

export function useIsMobile(): boolean {
  const useBreakpoint = createBreakpoint({
    XL: EBreakpointSizes.XL,
    L: EBreakpointSizes.L,
    M: EBreakpointSizes.M,
    S: EBreakpointSizes.S,
  });
  const breakpoint = useBreakpoint();

  return breakpoint === "S";
}

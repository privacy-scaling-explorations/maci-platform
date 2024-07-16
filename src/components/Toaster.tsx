import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export const Toaster = (): JSX.Element => {
  const { theme } = useTheme();
  return (
    <Sonner
      className="toaster group "
      position="top-center"
      theme={theme as "light" | "dark"}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "font-sans w-full flex justify-center p-4 rounded-xl",
          success: "bg-[#BBF7D0] text-[#14532D]",
          error: "bg-[#FEE2E2] text-[#5E1414]",
          title: "font-bold tracking-wider -mt-1",
          description: "text-sm",
        },
      }}
    />
  );
};

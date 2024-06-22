import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export const Toaster = (): JSX.Element => {
  const { theme } = useTheme();
  return (
    <Sonner
      className="toaster group "
      theme={theme as "light" | "dark"}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "bg-gray-900 font-sans w-full flex gap-2 p-4 border-2 rounded-xl",
          error: "group-[.toaster]:border-red-950 text-red-500",
          title: "font-bold tracking-wider -mt-1",
          description: "text-sm",
        },
      }}
    />
  );
};

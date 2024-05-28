import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as "light" | "dark"}
      position="top-center"
      className="toaster group "
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-red text-white font-sans w-full flex justify-center p-4 rounded-xl",
          error: "group-[.toaster]:border-red-950 text-red-500",
          title: "font-bold tracking-wider -mt-1",
          description: "text-sm",
        },
      }}
    />
  );
}

"use client";

import * as React from "react";
import { Switch } from "radix-ui";
import { useTheme } from "next-themes";

export default function SwitchDemo(){
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <form>
      <div className="flex items-center space-x-3">
        <label
          className="text-sm font-medium text-muted-foreground"
          htmlFor="theme-toggle"
        >
          Appearance
        </label>

        <Switch.Root
          id="theme-toggle"
          checked={isDark}
          onCheckedChange={(checked) =>
            setTheme(checked ? "dark" : "light")
          }
          className="relative h-[11px] w-[36px] cursor-pointer rounded-full bg-gray-200 dark:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-200 data-[state=checked]:bg-black"
          style={{ WebkitTapHighlightColor: "rgba(0,0,0,0)" }}
        >
          <Switch.Thumb
            className="block h-[11.5px] w-[12px] rounded-full bg-white shadow-lg transform transition-transform duration-200 data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-0"
          />
        </Switch.Root>
      </div>
    </form>
  );
}
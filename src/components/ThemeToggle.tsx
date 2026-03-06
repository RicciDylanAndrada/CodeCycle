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
      <div className="flex items-center">
        <label
          className="pr-[15px] text-[15px] leading-none text-muted-foreground"
          htmlFor="theme-mode"
        >
          {isDark ? "Dark Mode" : "Light Mode"}
        </label>

        <Switch.Root
          id="theme-mode"
          checked={isDark}
          onCheckedChange={(checked) =>
            setTheme(checked ? "dark" : "light")
          }
          className="relative h-[25px] w-[50px] cursor-pointer rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black"
          style={{ WebkitTapHighlightColor: "rgba(0,0,0,0)" }}
        >
          <Switch.Thumb
            className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[28px]"
          />
        </Switch.Root>
      </div>
    </form>
  );
}
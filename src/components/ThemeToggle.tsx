"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="px-4 py-2 rounded-lg border transition-colors
                 bg-white text-black dark:bg-black dark:text-white"
    >
      {isDark ? "Light Mode ☀️" : "Dark Mode 🌙"}
    </button>
  );
}
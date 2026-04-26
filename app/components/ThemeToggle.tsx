"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }}>
        <div style={{ width: 18, height: 18 }} />
      </button>
    );
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      style={{ padding: "6px 10px" }}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={18} className="text-secondary" />
      ) : (
        <Sun size={18} className="text-secondary" />
      )}
    </button>
  );
}

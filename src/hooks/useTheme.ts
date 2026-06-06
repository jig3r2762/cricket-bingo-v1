import { useState, useEffect } from "react";
import { isMobile } from "@/lib/platform";

type Theme = "light" | "dark";

const STORAGE_KEY = "cricket-bingo-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;
  
  if (isMobile()) {
    root.classList.add("mobile-theme", "dark");
    root.classList.remove("web-theme");
    body.classList.add("mobile-theme", "dark");
    body.classList.remove("web-theme");
    return;
  }
  
  root.classList.add("web-theme");
  root.classList.remove("mobile-theme");
  body.classList.add("web-theme");
  body.classList.remove("mobile-theme");
  
  if (theme === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (isMobile()) return "dark";
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    
    // Default Web theme is light (the day-match theme)
    return "light";
  });

  useEffect(() => {
    applyTheme(theme);
    if (!isMobile()) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    }
  }, [theme]);

  // Apply on mount
  useEffect(() => { applyTheme(theme); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    if (isMobile()) return; // Lock Mobile to dark stadium theme
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return { theme: isMobile() ? "dark" : theme, toggle };
}

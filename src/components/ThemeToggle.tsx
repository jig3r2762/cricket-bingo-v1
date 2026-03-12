import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl border-2 border-gray-200 bg-white text-gray-500 hover:text-gray-700 transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:text-white"
      style={{ boxShadow: "0 2px 0 #d1d5db" }}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}

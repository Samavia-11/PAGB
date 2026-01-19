"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "rose" | "green" | "forest" | "maroon";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("forest");

  useEffect(() => {
    // Load saved theme from localStorage or system preference
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? "forest";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    
    console.log(`🎨 Applying theme: ${newTheme}`); // Debug log
    console.log(`🔍 Current root classes before: ${root.className}`); // Debug log
    
    // handle dark class separately so color theme and dark/light can co-exist
    if (newTheme === "dark") {
      root.classList.add("dark");
      console.log(`✅ Added 'dark' class`);
    } else {
      root.classList.remove("dark");
      console.log(`❌ Removed 'dark' class`);
    }

    // remove any previous color theme classes (prefixed with theme-)
    Array.from(root.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => {
        console.log(`🗑️ Removing theme class: ${c}`);
        root.classList.remove(c);
      });

    const colorThemes: Record<Theme, string | null> = {
      light: null,
      dark: null,
      rose: "theme-rose",
      green: "theme-green",
      forest: "theme-forest",
      maroon: "theme-maroon",
    } as const;

    const colorClass = colorThemes[newTheme];
    if (colorClass) {
      console.log(`➕ Adding theme class: ${colorClass}`);
      root.classList.add(colorClass);
      
      // Also directly set CSS variables as backup
      const themeColors: Record<Theme, { primary: string; dark: string } | null> = {
        light: { primary: '#0284c7', dark: '#0369a1' },
        dark: { primary: '#0284c7', dark: '#0369a1' },
        rose: { primary: '#f43f5e', dark: '#be123c' },
        green: { primary: '#10b981', dark: '#047857' },
        forest: { primary: '#166534', dark: '#065f46' },
        maroon: { primary: '#800000', dark: '#4d0000' },
      };
      
      const colors = themeColors[newTheme];
      if (colors) {
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--primary-color-dark', colors.dark);
        console.log(`🎨 Direct CSS variables set: ${colors.primary}, ${colors.dark}`);
      }
    } else {
      console.log(`ℹ️ No color class for theme: ${newTheme}`);
    }
    
    // Verify the classes are applied
    console.log(`🔍 Current root classes after: ${root.className}`);
    
    // Also log the computed CSS variables
    const computedStyle = getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue('--primary-color');
    console.log(`🎨 Current --primary-color: ${primaryColor}`);
    
    // Force a style recalculation
    root.style.display = 'none';
    root.offsetHeight; // Trigger reflow
    root.style.display = '';
    
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

"use client";

import { useTheme, Theme } from "@/contexts/ThemeContext";

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "rose", label: "Rose Pink" },
  { value: "green", label: "Green" },
  { value: "forest", label: "Forest" },
  { value: "maroon", label: "Maroon" },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as Theme;
    console.log(`🔄 Theme selector changed to: ${newTheme}`);
    setTheme(newTheme);
  };

  return (
    <select
      value={theme}
      onChange={handleThemeChange}
      className="text-sm border border-academic-300 dark:border-gray-600 rounded-md py-1 px-2 bg-white dark:bg-gray-800 text-academic-700 dark:text-academic-100 focus:outline-none"
    >
      {themes.map((t) => (
        <option key={t.value} value={t.value} className="dark:bg-gray-800">
          {t.label}
        </option>
      ))}
    </select>
  );
};

export default ThemeSelector;

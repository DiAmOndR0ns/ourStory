import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BlueTheme } from "../components/StitchCompanion";

interface ThemeContextType {
  theme: BlueTheme;
  setTheme: (theme: BlueTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "stitch-ocean",
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BlueTheme>(() => {
    const saved = localStorage.getItem("our_story_blue_theme");
    return (saved as BlueTheme) || "stitch-ocean";
  });

  const setTheme = (newTheme: BlueTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("our_story_blue_theme", newTheme);
  };

  useEffect(() => {
    // Apply dataset or class to body
    document.documentElement.dataset.blueTheme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBlueTheme() {
  return useContext(ThemeContext);
}

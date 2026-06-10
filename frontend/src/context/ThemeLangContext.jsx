import { createContext, useContext, useState, useEffect } from "react";

const ThemeLangContext = createContext(null);

export function ThemeLangProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "vi";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleLang = () => {
    const nextLang = lang === "vi" ? "en" : "vi";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
  };

  // Synchronize theme class on HTML element for any Tailwind standard theme configurations
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeLangContext.Provider value={{ theme, toggleTheme, lang, toggleLang, setLang }}>
      {children}
    </ThemeLangContext.Provider>
  );
}

export function useThemeLang() {
  const context = useContext(ThemeLangContext);
  if (!context) {
    throw new Error("useThemeLang must be used within a ThemeLangProvider");
  }
  return context;
}

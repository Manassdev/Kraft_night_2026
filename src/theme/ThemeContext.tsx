import React, { createContext, useContext, useState } from 'react';
import { darkColors, lightColors, ThemeColors } from './theme';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDark(enabled);
  };

  const currentTheme = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme: currentTheme,
        toggleTheme,
        setDarkMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      isDark: false,
      theme: lightColors,
      toggleTheme: () => {},
      setDarkMode: () => {},
    };
  }
  return context;
};

import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('hergod_dark') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('hergod_dark', dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
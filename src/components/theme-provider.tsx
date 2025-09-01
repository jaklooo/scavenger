'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Load theme from localStorage and Firestore
  useEffect(() => {
    const loadTheme = async () => {
      let selectedTheme: Theme = 'light';

      // First, try localStorage (immediate)
      const localTheme = localStorage.getItem('theme') as Theme;
      if (localTheme && (localTheme === 'light' || localTheme === 'dark')) {
        selectedTheme = localTheme;
      }

      // If user is logged in, try to get theme from Firestore
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const firestoreTheme = userDoc.data()?.theme as Theme;
          if (firestoreTheme && (firestoreTheme === 'light' || firestoreTheme === 'dark')) {
            // Firestore has priority if user is logged in and has a theme set
            selectedTheme = firestoreTheme;
            // Update localStorage to match
            localStorage.setItem('theme', firestoreTheme);
          } else if (localTheme) {
            // If Firestore doesn't have theme but localStorage does, save to Firestore
            await updateDoc(doc(db, 'users', user.uid), { theme: localTheme });
          }
        } catch (error) {
          console.warn('Failed to load theme from Firestore:', error);
        }
      }

      // Apply the selected theme
      setTheme(selectedTheme);
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
      setMounted(true);
    };

    loadTheme();
  }, [user?.uid]);

  const handleSetTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    // Save to Firestore if user is logged in
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { theme: newTheme });
      } catch (error) {
        console.warn('Failed to save theme to Firestore:', error);
      }
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

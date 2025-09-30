'use client';

import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { useAppStore } from '@/store/useAppStore';
import { config } from '@/lib/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RainbowKitProvider
            theme={theme === 'dark' ? darkTheme({
              accentColor: '#3b82f6',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            }) : lightTheme({
              accentColor: '#3b82f6',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
            })}
            modalSize="compact"
            showRecentTransactions={true}
            coolMode={false}
            appInfo={{
              appName: 'FHE-Pay',
              learnMoreUrl: 'https://docs.fhe-pay.com'
            }}
          >
            {children}
          </RainbowKitProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}